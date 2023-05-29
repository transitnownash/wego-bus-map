/* globals L */

/**
 * Modified to allow for shadow rotation isolated from marker
 * @author hanying33
 * @url https://github.com/hanying33/Leaflet.RotatedMarkerWithShadow
 * */
(function (L) {
  // save these original methods before they are overwritten
  const protoInitIcon = L.Marker.prototype._initIcon;
  const protoSetPos = L.Marker.prototype._setPos;

  const oldIE = (L.DomUtil.TRANSFORM === 'msTransform');

  L.Marker.addInitHook(function () {
    let { iconAnchor } = this.options.icon.options;
    let { shadowAnchor } = this.options.icon.options;
    if (iconAnchor) {
      iconAnchor = (`${iconAnchor[0]}px ${iconAnchor[1]}px`);
    }
    if (shadowAnchor) {
      shadowAnchor = (`${shadowAnchor[0]}px ${shadowAnchor[1]}px`);
    }
    this.options.rotationShadowOrigin = this.options.rotationShadowOrigin || shadowAnchor || 'center bottom';
    this.options.rotationOrigin = this.options.rotationOrigin || iconAnchor || 'center bottom';
    this.options.rotationAngle = this.options.rotationAngle || 0;
    this.options.rotationShadowAngle = this.options.rotationShadowAngle || 0;
  });

  L.Marker.include({
    _initIcon() {
      protoInitIcon.call(this);
    },

    _setPos(pos) {
      protoSetPos.call(this, pos);

      if (this.options.rotationAngle || this.options.rotationShadowOrigin) {
        if (this._icon) {
          this._icon.style[`${L.DomUtil.TRANSFORM}Origin`] = this.options.rotationOrigin;
        }
        if (this._shadow) {
          this._shadow.style[`${L.DomUtil.TRANSFORM}Origin`] = this.options.rotationShadowOrigin;
        }

        if (oldIE) {
          // for IE 9, use the 2D rotation
          if (this._icon) {
            this._icon.style[L.DomUtil.TRANSFORM] = ` rotate(${this.options.rotationAngle}deg)`;
          }
          if (this._shadow) {
            this._shadow.style[L.DomUtil.TRANSFORM] = ` rotate(${this.options.rotationShadowAngle}deg)`;
          }
        } else {
          // for modern browsers, prefer the 3D accelerated version
          if (this._icon) {
            this._icon.style[L.DomUtil.TRANSFORM] += ` rotateZ(${this.options.rotationAngle}deg)`;
          }
          if (this._shadow) {
            this._shadow.style[L.DomUtil.TRANSFORM] += ` rotateZ(${this.options.rotationShadowAngle}deg)`;
          }
        }
      }
    },

    setRotationAngle(angle) {
      this.options.rotationAngle = angle;
      this.update();
      return this;
    },

    setRotationShadowAngle(angle) {
      this.options.rotationShadowAngle = angle;
      this.update();
      return this;
    },

    setRotationOrigin(origin) {
      this.options.rotationOrigin = origin;
      this.update();
      return this;
    },

    setRotationShadowOrigin(origin) {
      this.options.rotationShadowOrigin = origin;
      this.update();
      return this;
    },
  });
}(L));
