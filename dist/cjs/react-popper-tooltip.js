'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _objectWithoutPropertiesLoose = require('@babel/runtime/helpers/objectWithoutPropertiesLoose');
var _extends = require('@babel/runtime/helpers/extends');
var React = require('react');
var reactPopper = require('react-popper');

function useGetLatest(val) {
  var ref = React.useRef(val);
  ref.current = val;
  return React.useCallback(function () {
    return ref.current;
  }, []);
}

var noop = function noop() {// do nothing
};

function useControlledState(_ref) {
  var initial = _ref.initial,
      value = _ref.value,
      _ref$onChange = _ref.onChange,
      onChange = _ref$onChange === void 0 ? noop : _ref$onChange;

  if (initial === undefined && value === undefined) {
    throw new TypeError('Either "value" or "initial" variable must be set. Now both are undefined');
  }

  var _React$useState = React.useState(initial),
      state = _React$useState[0],
      setState = _React$useState[1];

  var getLatest = useGetLatest(state);
  var set = React.useCallback(function (updater) {
    var state = getLatest();
    var updatedState = typeof updater === 'function' ? updater(state) : updater;
    if (typeof updatedState.persist === 'function') updatedState.persist();
    setState(updatedState);
    if (typeof onChange === 'function') onChange(updatedState);
  }, [getLatest, onChange]);
  var isControlled = value !== undefined;
  return [isControlled ? value : state, isControlled ? onChange : set];
}
function generateBoundingClientRect(x, y) {
  if (x === void 0) {
    x = 0;
  }

  if (y === void 0) {
    y = 0;
  }

  return function () {
    return {
      width: 0,
      height: 0,
      top: y,
      right: x,
      bottom: y,
      left: x,
      x: 0,
      y: 0,
      toJSON: function toJSON() {
        return null;
      }
    };
  };
}

var _excluded = ["styles", "attributes"];
var virtualElement = {
  getBoundingClientRect: generateBoundingClientRect()
};
var defaultConfig = {
  closeOnOutsideClick: true,
  closeOnTriggerHidden: false,
  defaultVisible: false,
  delayHide: 0,
  delayShow: 0,
  followCursor: false,
  interactive: false,
  mutationObserverOptions: {
    attributes: true,
    childList: true,
    subtree: true
  },
  offset: [0, 6],
  trigger: 'hover'
};
function usePopperTooltip(config, popperOptions) {
  var _popperProps$state, _popperProps$state$mo, _popperProps$state$mo2;

  if (config === void 0) {
    config = {};
  }

  if (popperOptions === void 0) {
    popperOptions = {};
  }

  // Merging options with default options.
  // Keys with undefined values are replaced with the default ones if any.
  // Keys with other values pass through.
  var finalConfig = Object.keys(defaultConfig).reduce(function (config, key) {
    var _extends2;

    return _extends({}, config, (_extends2 = {}, _extends2[key] = config[key] !== undefined ? config[key] : defaultConfig[key], _extends2));
  }, config);
  var defaultModifiers = React.useMemo(function () {
    return [{
      name: 'offset',
      options: {
        offset: finalConfig.offset
      }
    }];
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  Array.isArray(finalConfig.offset) ? finalConfig.offset : []);

  var finalPopperOptions = _extends({}, popperOptions, {
    placement: popperOptions.placement || finalConfig.placement,
    modifiers: popperOptions.modifiers || defaultModifiers
  });

  var _React$useState = React.useState(null),
      triggerRef = _React$useState[0],
      setTriggerRef = _React$useState[1];

  var _React$useState2 = React.useState(null),
      tooltipRef = _React$useState2[0],
      setTooltipRef = _React$useState2[1];

  var _useControlledState = useControlledState({
    initial: finalConfig.defaultVisible,
    value: finalConfig.visible,
    onChange: finalConfig.onVisibleChange
  }),
      visible = _useControlledState[0],
      setVisible = _useControlledState[1];

  var timer = React.useRef();
  React.useEffect(function () {
    return function () {
      return clearTimeout(timer.current);
    };
  }, []);

  var _usePopper = reactPopper.usePopper(finalConfig.followCursor ? virtualElement : triggerRef, tooltipRef, finalPopperOptions),
      styles = _usePopper.styles,
      attributes = _usePopper.attributes,
      popperProps = _objectWithoutPropertiesLoose(_usePopper, _excluded);

  var update = popperProps.update;
  var getLatest = useGetLatest({
    visible: visible,
    triggerRef: triggerRef,
    tooltipRef: tooltipRef,
    finalConfig: finalConfig
  });
  var isTriggeredBy = React.useCallback(function (trigger) {
    return Array.isArray(finalConfig.trigger) ? finalConfig.trigger.includes(trigger) : finalConfig.trigger === trigger;
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  Array.isArray(finalConfig.trigger) ? finalConfig.trigger : [finalConfig.trigger]);
  var hideTooltip = React.useCallback(function () {
    clearTimeout(timer.current);
    timer.current = window.setTimeout(function () {
      return setVisible(false);
    }, finalConfig.delayHide);
  }, [finalConfig.delayHide, setVisible]);
  var showTooltip = React.useCallback(function () {
    clearTimeout(timer.current);
    timer.current = window.setTimeout(function () {
      return setVisible(true);
    }, finalConfig.delayShow);
  }, [finalConfig.delayShow, setVisible]);
  var toggleTooltip = React.useCallback(function () {
    if (getLatest().visible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  }, [getLatest, hideTooltip, showTooltip]); // Handle click outside

  React.useEffect(function () {
    if (!getLatest().finalConfig.closeOnOutsideClick) return;

    var handleClickOutside = function handleClickOutside(event) {
      var _event$composedPath;

      var _getLatest = getLatest(),
          tooltipRef = _getLatest.tooltipRef,
          triggerRef = _getLatest.triggerRef;

      var target = (event.composedPath == null ? void 0 : (_event$composedPath = event.composedPath()) == null ? void 0 : _event$composedPath[0]) || event.target;

      if (target instanceof Node) {
        if (tooltipRef != null && triggerRef != null && !tooltipRef.contains(target) && !triggerRef.contains(target)) {
          hideTooltip();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return function () {
      return document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [getLatest, hideTooltip]); // Trigger: click

  React.useEffect(function () {
    if (triggerRef == null || !isTriggeredBy('click')) return;
    triggerRef.addEventListener('click', toggleTooltip);
    return function () {
      return triggerRef.removeEventListener('click', toggleTooltip);
    };
  }, [triggerRef, isTriggeredBy, toggleTooltip]); // Trigger: double-click

  React.useEffect(function () {
    if (triggerRef == null || !isTriggeredBy('double-click')) return;
    triggerRef.addEventListener('dblclick', toggleTooltip);
    return function () {
      return triggerRef.removeEventListener('dblclick', toggleTooltip);
    };
  }, [triggerRef, isTriggeredBy, toggleTooltip]); // Trigger: right-click

  React.useEffect(function () {
    if (triggerRef == null || !isTriggeredBy('right-click')) return;

    var preventDefaultAndToggle = function preventDefaultAndToggle(event) {
      // Don't show the context menu
      event.preventDefault();
      toggleTooltip();
    };

    triggerRef.addEventListener('contextmenu', preventDefaultAndToggle);
    return function () {
      return triggerRef.removeEventListener('contextmenu', preventDefaultAndToggle);
    };
  }, [triggerRef, isTriggeredBy, toggleTooltip]); // Trigger: focus

  React.useEffect(function () {
    if (triggerRef == null || !isTriggeredBy('focus')) return;
    triggerRef.addEventListener('focus', showTooltip);
    triggerRef.addEventListener('blur', hideTooltip);
    return function () {
      triggerRef.removeEventListener('focus', showTooltip);
      triggerRef.removeEventListener('blur', hideTooltip);
    };
  }, [triggerRef, isTriggeredBy, showTooltip, hideTooltip]); // Trigger: hover on trigger

  React.useEffect(function () {
    if (triggerRef == null || !isTriggeredBy('hover')) return;
    triggerRef.addEventListener('mouseenter', showTooltip);
    triggerRef.addEventListener('mouseleave', hideTooltip);
    return function () {
      triggerRef.removeEventListener('mouseenter', showTooltip);
      triggerRef.removeEventListener('mouseleave', hideTooltip);
    };
  }, [triggerRef, isTriggeredBy, showTooltip, hideTooltip]); // Trigger: hover on tooltip, keep it open if hovered

  React.useEffect(function () {
    if (tooltipRef == null || !isTriggeredBy('hover') || !getLatest().finalConfig.interactive) return;
    tooltipRef.addEventListener('mouseenter', showTooltip);
    tooltipRef.addEventListener('mouseleave', hideTooltip);
    return function () {
      tooltipRef.removeEventListener('mouseenter', showTooltip);
      tooltipRef.removeEventListener('mouseleave', hideTooltip);
    };
  }, [tooltipRef, showTooltip, hideTooltip, getLatest]); // Handle closing tooltip if trigger hidden

  var isReferenceHidden = popperProps == null ? void 0 : (_popperProps$state = popperProps.state) == null ? void 0 : (_popperProps$state$mo = _popperProps$state.modifiersData) == null ? void 0 : (_popperProps$state$mo2 = _popperProps$state$mo.hide) == null ? void 0 : _popperProps$state$mo2.isReferenceHidden;
  React.useEffect(function () {
    if (finalConfig.closeOnTriggerHidden && isReferenceHidden) hideTooltip();
  }, [finalConfig.closeOnTriggerHidden, hideTooltip, isReferenceHidden]); // Handle follow cursor

  React.useEffect(function () {
    if (!finalConfig.followCursor || triggerRef == null) return;

    function setMousePosition(_ref) {
      var clientX = _ref.clientX,
          clientY = _ref.clientY;
      virtualElement.getBoundingClientRect = generateBoundingClientRect(clientX, clientY);
      update == null ? void 0 : update();
    }

    triggerRef.addEventListener('mousemove', setMousePosition);
    return function () {
      return triggerRef.removeEventListener('mousemove', setMousePosition);
    };
  }, [finalConfig.followCursor, triggerRef, update]); // Handle tooltip DOM mutation changes (aka mutation observer)

  React.useEffect(function () {
    if (tooltipRef == null || update == null || finalConfig.mutationObserverOptions == null) return;
    var observer = new MutationObserver(update);
    observer.observe(tooltipRef, finalConfig.mutationObserverOptions);
    return function () {
      return observer.disconnect();
    };
  }, [finalConfig.mutationObserverOptions, tooltipRef, update]); // Tooltip props getter

  var getTooltipProps = function getTooltipProps(args) {
    if (args === void 0) {
      args = {};
    }

    return _extends({}, args, {
      style: _extends({}, args.style, styles.popper)
    }, attributes.popper, {
      'data-popper-interactive': finalConfig.interactive
    });
  }; // Arrow props getter


  var getArrowProps = function getArrowProps(args) {
    if (args === void 0) {
      args = {};
    }

    return _extends({}, args, attributes.arrow, {
      style: _extends({}, args.style, styles.arrow),
      'data-popper-arrow': true
    });
  };

  return _extends({
    getArrowProps: getArrowProps,
    getTooltipProps: getTooltipProps,
    setTooltipRef: setTooltipRef,
    setTriggerRef: setTriggerRef,
    tooltipRef: tooltipRef,
    triggerRef: triggerRef,
    visible: visible
  }, popperProps);
}

exports.usePopperTooltip = usePopperTooltip;
//# sourceMappingURL=react-popper-tooltip.js.map
