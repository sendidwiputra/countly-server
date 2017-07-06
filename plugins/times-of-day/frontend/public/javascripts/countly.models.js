(function (countlyTimesOfDay, $) {
  var _data = {};
  /**
     * This is for fetching custom event data & times of day data base on event's value
     * @namespace countlyTimesOfDay
     * @method loadData
     * @param {event}
     * @return {func} ajax func to request data and store in _data
     */
  countlyTimesOfDay.loadData = function (event) {
    return $.ajax({
        type:"GET",
        url:"/o",
        data:{
          "api_key":countlyGlobal.member.api_key,
          "app_id":countlyCommon.ACTIVE_APP_ID,
          "method":"timesofday",
          "event":event
        },
        success:function (json) {
           _data = json;
        }
    });
 	};
  countlyTimesOfDay.getData = function () {
		return _data;
  };
}(window.countlyTimesOfDay = window.countlyTimesOfDay || {}, jQuery));