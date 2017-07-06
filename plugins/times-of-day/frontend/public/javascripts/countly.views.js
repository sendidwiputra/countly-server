window.TimesOfDayView = countlyView.extend({
	/**
     * this variable contains the current selected dropdown value.
     * @type String
     */
	selectedEvent:'sessions',
	initialize:function (){
	},
	beforeRender: function() {
    	if(this.template)
			return $.when(countlyTimesOfDay.loadData(this.selectedEvent)).then(function () {});
		else{
			var self = this;
			return $.when($.get(countlyGlobal["path"]+'/times-of-day/templates/times.html', function(src){
				self.template = Handlebars.compile(src);
			}), countlyTimesOfDay.loadData(self.selectedEvent)).then(function () {});
		}
	},
	renderCommon:function () {
	    this.templateData = {
            "page-title":"Times of Day",
            "logo-class":""
        };
		$(this.el).html(this.template(this.templateData));
		this.loadEvents();
		this.renderPunchCard();
	},
	/**
     * This is update punch card base on timesofdayView.selectedEvent's value.
     * @namespace timesofdayView
     * @method refreshPunchCard
     * @param {null}
     * @return {null}
     */
	renderPunchCard:function(){
		if(countlyTimesOfDay.getData().status=="OK"){
			var dow=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
			var hour=["12 am","1 am","2 am","3 am","4 am","5 am","6 am","7 am","8 am","9 am","10 am","11 am","12 pm","1 pm","2 pm","3 pm","4 pm","5 pm","6 pm","7 pm","8 pm","9 pm","10 pm","11 pm"]
			var csv=[];
			for(var i=0;i<=7;i++){
				csv[i]=[];
				for(var j=0;j<=24;j++){
					if(i==0 && j==0){
						csv[i][j]="";
					} else if(i==0){
						csv[i][j]=hour[j-1];
					} else if(j==0){
						csv[i][j]=dow[i-1];
					} else
						csv[i][j]=0;
				}
			}
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
	/**
     * This is update custom event drowdown.
     * @namespace timesofdayView
     * @method loadEvents
     * @param {null}
     * @return {null}
     */
	loadEvents:function(){
		if(countlyTimesOfDay.getData().status=="OK"){
			var modelEvents=countlyTimesOfDay.getData().events;
			var modelMapEvents=countlyTimesOfDay.getData().mapEvents;
			$("#event-list").html('<div data-value="sessions" class="event-option item" data-localize="timesofday.sessions">'+jQuery.i18n.map['timesofday.sessions']+'</div>');
			for(var i=0;i<modelEvents.length;i++){
				$("#event-list").append('<div data-value="'+modelEvents[i]+'" class="event-option item">'+(modelMapEvents[modelEvents[i]]||modelEvents[i])+'</div>');
			}
			var self = this;
	        $(".event-option").on("click", function () {
	            self.selectedEvent = $(this).data("value");
	            self.refresh();
	        });
		}
	},
	refresh:function () {
		var self = this;
		$.when(countlyTimesOfDay.loadData(self.selectedEvent)).then(function () {
			if (app.activeView != self) {
				return false;
			}
			self.loadEvents();
			self.renderPunchCard();
		});
    }
});

//register views
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