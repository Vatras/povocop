function ajaxRequest(options,callback){
    $('#loadingSpinner').removeClass('hidden')
    var emptyFun=function(){}
    callback = callback || emptyFun
    setTimeout(function(){
        $.ajax ({
            url: options.url,
            type: options.method,
            data: JSON.stringify(options.data),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(response){
                $('#loadingSpinner').addClass('hidden');
                callback(response)
            },
            error:function(err){
                $('#loadingSpinner').addClass('hidden');
                alert(typeof err === "object" ? JSON.stringify(err,null,2) :  err);
            }
        });
    },500)
}