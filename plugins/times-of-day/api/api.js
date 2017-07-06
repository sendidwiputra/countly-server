var plugin = {},
	common = require('../../../api/utils/common.js'),
	log = common.log('timesofday:api'),
    plugins = require('../../pluginManager.js'),
    async = require("async"),
    mongo = require("mongoskin");

(function (plugin) {
	/**
     * register for recording number of sessions & custom sessions
     */
	plugins.register("/i", function(ob){
		if(ob.params.qstring.begin_session){
			if(ob.params.qstring.events){
				try{
					var events=ob.params.qstring.events;
					async.timesSeries(events.length,function(n,next){
						common.db.collection("timesofday"+ob.params.app._id.toString()).update({
							event:events[n].key,
							dow:events[n].dow,
							hour:events[n].hour
						},{
							$inc:{count:events[n].count}
						},{upsert:true},function(err,result){
							next(null);
						});
					},function(err,result){
						if(err)
							log.e(err);
					});
					return true;
				}catch(e){
					console.log(e);
					return false;
				}
			} else {
				common.db.collection("timesofday"+ob.params.app._id.toString()).update({
					event:"sessions",
					dow:ob.params.qstring.dow,
					hour:ob.params.qstring.hour
				},{
					$inc:{count:1}
				},{upsert:true},function(err,result){
					if(err)
						log.e(err);
				});
				return true;
			}
		}
		return false;
	});
	/**
     * register for fetching custom events metadata & times of day data
     */
	plugins.register("/o", function(ob){
		if (ob.params.qstring.method == 'timesofday') {
			async.waterfall([
				function(next){
					common.db.collection("events").findOne({_id:mongo.helper.toObjectID(ob.params.qstring.app_id)},next);
				},
				function(event,next){
					var criteria={};
					if(ob.params.qstring.event)
						criteria.event=ob.params.qstring.event;
					common.db.collection("timesofday"+ob.params.qstring.app_id).aggregate([
						{
							$match:criteria
						},
						{
							$group:{
								_id:{
									dow:"$dow",
									hour:"$hour"
								},
								total:{$sum:"$count"}
							}
						}
					],function(err,results){
						next(err,event,results);
					});
				}
			],function(err,event,results){
				if(err)
					return common.returnOutput(ob.params,{status:"ERROR",error:err});
				if(event)
					common.returnOutput(ob.params, {status:"OK",events:event.list,mapEvents:event.map||{},data:results});
				else
					common.returnOutput(ob.params, {status:"OK",events:[],mapEvents:{},data:results});
			});
			return true;
		}
		return false;
	});
}(plugin));

module.exports = plugin;