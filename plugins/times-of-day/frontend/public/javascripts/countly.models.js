(function (countlyTimesOfDay, $) {
  var _data = {};
  countlyTimesOfDay.initialize = function () {
    return $.ajax({
        type:"GET",
        url:"/o",
        data:{
          "api_key":countlyGlobal.member.api_key,
          "app_id":countlyCommon.ACTIVE_APP_ID,
          "method":"timesofday"
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