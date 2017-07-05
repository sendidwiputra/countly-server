var plugin = {},
	common = require('../../../api/utils/common.js'),
	log = common.log('timesofday:api'),
    plugins = require('../../pluginManager.js'),
    async = require("async");

(function (plugin) {
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
	plugins.register("/o", function(ob){
		if (ob.params.qstring.method == 'timesofday') {
			common.db.collection("timesofday"+ob.params.qstring.app_id).aggregate([
				{
					$group:{
						_id:{
							dow:"$dow",
							hour:"$hour"
						},
						total:{$sum:"$count"}
					}
				},
				{
					$sort:{
						"_id.dow":1,
						"_id.hour":1
					}
				}
			],function(err,results){
				if(err)
					return common.returnOutput(ob.params,{status:"ERROR",error:err});
				common.returnOutput(ob.params, {status:"OK",data:results});
			});
			return true;
		}
		return false;
	});
}(plugin));

module.exports = plugin;