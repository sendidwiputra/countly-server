window.TimesOfDayView = countlyView.extend({
	initialize:function (){
	},
	beforeRender: function() {
    	if(this.template)
			return $.when(countlyTimesOfDay.initialize()).then(function () {});
		else{
			var self = this;
			return $.when($.get(countlyGlobal["path"]+'/times-of-day/templates/times.html', function(src){
				self.template = Handlebars.compile(src);
			}), countlyTimesOfDay.initialize()).then(function () {});
		}
	},
	renderCommon:function () {
	    this.templateData = {
            "page-title":"Times of Day",
            "logo-class":"",
            "sessions":jQuery.i18n.map['timesofday.sessions']
        };
		$(this.el).html(this.template(this.templateData));
		var dow=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
		var csv=[];
		for(var i=0;i<=7;i++){
			csv[i]=[];
			for(var j=0;j<=24;j++){
				if(i==0 && j==0){
					csv[i][j]="";
				} else if(i==0){
					csv[i][j]=j-1;
				} else if(j==0){
					csv[i][j]=dow[i-1];
				} else
					csv[i][j]=0;
			}
		}
		if(countlyTimesOfDay.getData().status=="OK"){
			var modelData=countlyTimesOfDay.getData().data;
			for(var i=0;i<modelData.length;i++){
				csv[modelData[i]._id.dow+1][modelData[i]._id.hour+1]=modelData[i].total;
			}
		} else
			alert(""+countlyTimesOfDay.getData().error.message);
		var data=[];
		for(var i=1;i<csv.length;i++){
			data.push({label:csv[i][0],values:csv[i].slice(1)});
		}
		update(data,csv[0].slice(1));
	},
  
	refresh:function () {
		var self = this;
		$.when(countlyTimesOfDay.initialize()).then(function () {
			if (app.activeView != self) {
				return false;
			}
			self.renderCommon();
		});
    }
});
app.timesofdayView = new TimesOfDayView();

app.route('/analytics/timesofday', 'timesofday', function () {
	this.renderWhenReady(this.timesofdayView);
});

$( document ).ready(function() {
	var menu = '<a href="#/analytics/timesofday" class="item">' +
        '<div class="logo-icon fa fa-globe"></div>' +
        '<div class="text" data-localize="timesofday.menuTitle"></div>' +
        '</a>';
	$('#web-type #analytics-submenu').append(menu);
    $('#mobile-type #analytics-submenu').append(menu);
});