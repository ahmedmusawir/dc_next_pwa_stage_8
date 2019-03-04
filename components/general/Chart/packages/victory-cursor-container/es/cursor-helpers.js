import _mapValues from "lodash/mapValues";
import _isFunction from "lodash/isFunction";
import _throttle from "lodash/throttle";
import { Selection } from "victory-core";
var CursorHelpers = {
  withinBounds: function (point, bounds) {
    var _mapValues2 = _mapValues(bounds, Number),
        x1 = _mapValues2.x1,
        x2 = _mapValues2.x2,
        y1 = _mapValues2.y1,
        y2 = _mapValues2.y2;

    var _mapValues3 = _mapValues(point, Number),
        x = _mapValues3.x,
        y = _mapValues3.y;

    return x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1, y2) && y <= Math.max(y1, y2);
  },
  onMouseMove: function (evt, targetProps) {
    var onCursorChange = targetProps.onCursorChange,
        cursorDimension = targetProps.cursorDimension,
        domain = targetProps.domain;
    var parentSVG = targetProps.parentSVG || Selection.getParentSVG(evt);
    var cursorSVGPosition = Selection.getSVGEventCoordinates(evt, parentSVG);
    var cursorValue = Selection.getDataCoordinates(targetProps, targetProps.scale, cursorSVGPosition.x, cursorSVGPosition.y);
    var inBounds = this.withinBounds(cursorValue, {
      x1: domain.x[0],
      x2: domain.x[1],
      y1: domain.y[0],
      y2: domain.y[1]
    });

    if (!inBounds) {
      cursorValue = null;
    }

    if (_isFunction(onCursorChange)) {
      if (inBounds) {
        var value = cursorDimension ? cursorValue[cursorDimension] : cursorValue;
        onCursorChange(value, targetProps);
      } else if (cursorValue !== targetProps.cursorValue) {
        onCursorChange(targetProps.defaultCursorValue || null, targetProps);
      }
    }

    return [{
      target: "parent",
      eventKey: "parent",
      mutation: function () {
        return {
          cursorValue: cursorValue,
          parentSVG: parentSVG
        };
      }
    }];
  },
  onTouchEnd: function (evt, targetProps) {
    var onCursorChange = targetProps.onCursorChange;

    if (_isFunction(targetProps.onCursorChange)) {
      onCursorChange(null, targetProps);
    }

    return [{
      target: "parent",
      eventKey: "parent",
      mutation: function () {
        return {
          cursorValue: null
        };
      }
    }];
  }
};
export default {
  onMouseMove: _throttle(CursorHelpers.onMouseMove.bind(CursorHelpers), 32, // eslint-disable-line no-magic-numbers
  {
    leading: true,
    trailing: false
  }),
  onTouchEnd: CursorHelpers.onTouchEnd.bind(CursorHelpers)
};