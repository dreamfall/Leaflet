/*
 * L.Circle is a circle overlay (with a certain radius in meters).
 */

L.Circle = L.Path.extend({
	initialize: function (latlng, radius, options) {
		L.Path.prototype.initialize.call(this, options);

		this._latlng = L.latLng(latlng);

		this._mRadius = this._limitRadius(radius);

		if (L.Handler.CircleDrag) {
			this.dragging = new L.Handler.CircleDrag(this);

			if (this.options.draggable) {
				this.dragging.enable();
			}
		}

		if (L.Handler.CircleResize) {
			this.resizing = new L.Handler.CircleResize(this, options);

			if (this.options.resizable) {
				this.resizing.enable();
			}
		}
	},

	onAdd: function (map) {
		L.Path.prototype.onAdd.call(this, map);

		if (this.dragging && this.dragging.enabled()) {
			this.dragging.addHooks();
		}
		if (this.resizing && this.resizing.enabled()) {
			this.resizing.addHooks();
		}
	},

	onRemove: function (map) {
		if (this.dragging && this.dragging.enabled()) {
			this.dragging.removeHooks();
		}

		if (this.resizing && this.resizing.enabled()) {
			this.resizing.removeHooks();
		}

		L.Path.prototype.onRemove.call(this, map);
	},

	options: {
		fill: true
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		return this.redraw();
	},

	setRadius: function (radius) {
		this._mRadius = this._limitRadius(radius);

		return this.redraw();
	},

	projectLatlngs: function () {
		var lngRadius = this._getLngRadius(),
		    latlng2 = new L.LatLng(this._latlng.lat, this._latlng.lng - lngRadius, true),
		    point2 = this._map.latLngToLayerPoint(latlng2);

		this._point = this._map.latLngToLayerPoint(this._latlng);
		this._radius = Math.max(Math.round(this._point.x - point2.x), 1);
	},

	getBounds: function () {
		var lngRadius = this._getLngRadius(),
		    latRadius = (this._mRadius / 40075017) * 360,
		    latlng = this._latlng,
		    sw = new L.LatLng(latlng.lat - latRadius, latlng.lng - lngRadius),
		    ne = new L.LatLng(latlng.lat + latRadius, latlng.lng + lngRadius);

		return new L.LatLngBounds(sw, ne);
	},

	getLatLng: function () {
		return this._latlng;
	},

	getPathString: function () {
		var p = this._point,
		    r = this._radius;

		if (this._checkIfEmpty()) {
			return '';
		}

		if (L.Browser.svg) {
			return "M" + p.x + "," + (p.y - r) +
			       "A" + r + "," + r + ",0,1,1," +
			       (p.x - 0.1) + "," + (p.y - r) + " z";
		} else {
			p._round();
			r = Math.round(r);
			return "AL " + p.x + "," + p.y + " " + r + "," + r + " 0," + (65535 * 360);
		}
	},

	getRadius: function () {
		return this._mRadius;
	},

	_limitRadius: function (radius) {
		var tooBig = this.options.max_limit < radius,
		    tooSmall = this.options.min_limit > radius;

		if (!tooBig && !tooSmall) {
			return radius;
		} else {
			if (tooBig) {
				return this.options.max_limit;
			} else {
				return this.options.min_limit;
			}
		}
	},

	// TODO Earth hardcoded, move into projection code!

	_getLatRadius: function () {
		return (this._mRadius / 40075017) * 360;
	},

	_getLngRadius: function () {
		return this._getLatRadius() / Math.cos(L.LatLng.DEG_TO_RAD * this._latlng.lat);
	},

	_checkIfEmpty: function () {
		if (!this._map) {
			return false;
		}
		var vp = this._map._pathViewport,
		    r = this._radius,
		    p = this._point;

		return p.x - r > vp.max.x || p.y - r > vp.max.y ||
		       p.x + r < vp.min.x || p.y + r < vp.min.y;
	}
});

L.circle = function (latlng, radius, options) {
	return new L.Circle(latlng, radius, options);
};
