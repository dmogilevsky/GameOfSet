import TweenMax from "./node_modules/gsap";

function hoverAnimation() {
    const menuItemsShape = $(".js-shape"), linksWrapper = $(".js-menu-items-wrapper"), linksItems = $(".js-menu-item"),
        activeItem = $(".js-menu-item.is-active"), activeItemPosition = activeItem.position().top,
        menuItemsShapePath = $(".js-items-shape-path"), info = $(".js-info");

    TweenMax.set(menuItemsShape, {
        y: activeItemPosition
    });

    linksItems.on({
        mouseenter: function () {
            let selfParent, targetCircle, circlePosition, _self;
            _self = $(this);
            selfParent = _self.closest(linksWrapper);
            targetCircle = selfParent.find(menuItemsShape);

            if ($(window).width() < 800) {
                circlePosition = _self.position().top;
                TweenMax.to(targetCircle, 0.6, {
                    y: circlePosition, ease: "power2"
                });
            } else {
                circlePosition = _self.position().left;
                TweenMax.to(targetCircle, 0.6, {
                    x: circlePosition, ease: "power2"
                });
            }

            TweenMax.to(menuItemsShapePath, 1, {morphSVG: this.dataset.morph});
        }
    });

    linksWrapper.on({
        mouseleave: function () {
            let selfParent, activeLink, targetCircle, activeLinkPosition, _self;
            _self = $(this);
            selfParent = _self.closest(linksWrapper), activeLink = selfParent.find(activeItem), targetCircle =
                selfParent.find(menuItemsShape), activeLinkPosition = activeLink.position().top;

            if ($(window).width() < 800) {
                TweenMax.to(targetCircle, 0.6, {
                    y: activeLinkPosition, ease: "power2"
                });
            } else {
                TweenMax.to(targetCircle, 0.6, {
                    x: activeLinkPosition - 32, ease: "power2"
                });
            }

            TweenMax.to(menuItemsShapePath, 1, {morphSVG: menuItemsShapePath});
        }
    });

    $(window).resize(function () {
        info.show();
    });
}

hoverAnimation();