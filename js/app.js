$(document).ready(function() {

    var flickr = new Flickr({
        api_key: "5d961961315fc52a4fda50571e89ed99",
        secret:"2789740b044d9fce"
    });

    function scrollToAnchor(href) {
        var aTag = $("a[name='" + href + "']");
        $('html,body').animate({
            scrollTop: aTag.offset().top
        }, 'slow');
    }

    $("#morebuttondiv").hide();
    $(".image_slide").hide();

    $('.form_date').datetimepicker({
        format: "mm/dd/yyyy",
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0,
        endDate: "-1d",
        startDate: "2004-01-01"
    });

    $("#searchbutton").click(function(event) {
        event.preventDefault();
        thumbnail = [];
        URL = [];
        $(".errorMsg").empty();
        $("#flickr-images").empty();
        $(".wrapper").empty();
        $("#flickr-images").show();
        $(".footer").hide();
        var search_queries = document.getElementById("search_queries");
        search_array = getFormElements(search_queries);
        getFlickrPhotos(populateImages, search_array);
        
    });

    $("#start_over").click(function() {
        $(".footer").show();
        $("#flickr-images").hide();
        $(".wrapper").empty();
        document.getElementById("search_queries").reset();
    });


    function getFormElements(search_queries) {
        search_array = [];
        for (var i = 0; i < search_queries.length; i++) {
            search_array[i] = search_queries[i].value;
        }
        var mindate = document.getElementById("mindate").value;
        var maxdate = document.getElementById("maxdate").value;
        var min_upload_date;
        var max_upload_date;

        if (mindate != "") {
            min_upload_date = new Date(mindate).getTime() / 1000;
        } else {
            min_upload_date = mindate;
        }
        if (maxdate != "") {
            var max_upload_date = new Date(maxdate).getTime() / 1000;
        } else {
            max_upload_date = maxdate;
        }
        search_array[2] = min_upload_date;
        search_array[3] = max_upload_date;
        return search_array;
    }

    function getNSID(search_items, callback) {   
        var username = document.getElementById("username").value;  
        flickr.people.findByUsername({
            username: username
        }      , function(err, user) {    
            if (err) {        
             	var a_href = $("<a/>").attr("href", "#alert").attr("class", "close").attr("data-dismiss","alert").html("Username not found!");
	         	var error = $("<div/>").attr("class", "alert alert-error").attr("id", "alert").html(a_href);
	            $(error).appendTo(".errorMsg");

                document.getElementById("search_queries").reset();  
                return; 
            }
            search_items["user_id"] = user.user.id;
            searchFlickr(callback, search_items);
        });
    }

    function getFlickrPhotos(callback, search_array) {
        var search_items = {};
        search_items["text"] = search_array[0];
        search_items["min_upload_date"] = search_array[2];
        search_items["max_upload_date"] = search_array[3];

        if (search_array[1] != "") {
            getNSID(search_items, callback);
        } else {
            if (search_items["text"] == "" && search_items["min_upload_date"] == "" && search_items["max_upload_date"] == "") {
                var a_href = $("<a/>").attr("href", "#alert").attr("class", "close").attr("data-dismiss","alert").html("Please enter one or more fields.");
                var error = $("<div/>").attr("class", "alert alert-error").attr("id", "alert").html(a_href);
                $(error).appendTo(".errorMsg");
            }
            searchFlickr(callback, search_items);
        }
    }

    var thumbnail = [];
    var URL = [];
    var ownerpage = [];

    function searchFlickr(callback, search_items) {
        flickr.photos.search(search_items, function(err, result) {
            if (err) {
                throw new Error(err);
            } else {
                var photos = result.photos.photo;
                if (photos.length == 0) {
                    var a_href = $("<a/>").attr("href", "#alert").attr("class", "close").attr("data-dismiss","alert").html("No photos found. Please try again!");
	         		var error = $("<div/>").attr("class", "alert alert-error").attr("id", "alert").html(a_href);
                    $(".image_slide").hide();
	            	$(error).appendTo(".errorMsg");
                    document.getElementById("search_queries").reset();
                    return;
                }

                for (var i = 0; i < photos.length; i++) {
                    thumbnail[i] = "http://farm" + photos[i].farm + ".static.flickr.com/" + photos[i].server + "/" + photos[i].id + "_" + photos[i].secret + "_m.jpg";
                    URL[i] = "http://www.flickr.com/photos/" + photos[i].owner + "/" + photos[i].id;
                    ownerpage[i] = "http://www.flickr.com/people/" + photos[i].owner + "/";
                }
                callback(thumbnail, URL, photos);
            }
        });
    }


    function tryAgain() {
        $("<br><br><br><br>No more photos.<br><br>").appendTo("#flickr-images");
        $("<a class=\"button btn btn-info btn-mid\" id=\"try_again\" align=\"center\" href=\"#top\">Search again!</a>").appendTo("#flickr-images");
        $(".image_slide").show();
        $("#morebuttondiv").hide();
        $("#try_again").click(function() {
            $(".footer").show();
            $(".image_slide").hide();
            $(".wrapper").empty();
            document.getElementById("search_queries").reset();
            scrollToAnchor("top");
        });
    }

    $("#morebutton").click(function() {
        populateImages(thumbnail, URL);
    });

    function populateImages(thumbnail, URL, photos) {
        $(".image_slide").show();
        $(".image_header").show();
        $(".footer").show();
        if (thumbnail.length < 10) {
            for (var k = 0; k < thumbnail.length; k++) {
                var img_thumb = $("<img/>").attr("src", thumbnail[k]).attr("id", "images").css("margin", "10px");
	            var photo = $("<a/>").attr("href", URL[k]).attr("target", "_blank").html(img_thumb);

	            var usr_thumb = $("<span/>").attr("class", "glyphicon glyphicon-user").attr("id", "thumb").css("margin", "10px");
	            var usr = $("<a/>").attr("href", ownerpage[k]).attr("target", "_blank").html(usr_thumb);

	            var out_span = $("<span/>").attr("class", "whole_image").appendTo("#flickr-images");
	            photo.appendTo(out_span);
	            usr.appendTo(out_span);
                
            }
        	scrollToAnchor("end");
            tryAgain();
            return;
        }

        for (var i = 0; i < 10; i++) {

            var img_thumb = $("<img/>").attr("src", thumbnail[i]).attr("id", "images").css("margin", "10px");
            var photo = $("<a/>").attr("href", URL[i]).attr("target", "_blank").html(img_thumb);

            var usr_thumb = $("<span/>").attr("class", "glyphicon glyphicon-user").attr("id", "thumb").css("margin", "10px");
            var usr = $("<a/>").attr("href", ownerpage[i]).attr("target", "_blank").html(usr_thumb);

            var out_span = $("<span/>").attr("class", "whole_image").appendTo("#flickr-images");
            photo.appendTo(out_span);
            usr.appendTo(out_span);

        }

        thumbnail.splice(0, 10);
        URL.splice(0, 10);
        ownerpage.splice(0,10);

        $("#morebuttondiv").show();

        if (thumbnail.length == 0) {
            tryAgain();
        }
        scrollToAnchor("end");
   	  
    }

});