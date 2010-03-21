var shl = new ActiveXObject("WScript.Shell");
var current_title, current_artist, current_album;
var last_title, last_artist, last_album;
var lyrics;

var current_page=1;
var max_pages;
var force_update = false;

$(document).ready(function() {
	alert("HUD Lyrics: Ready");
	update_track();
});

function next_page()
{
	if((current_page + 1) > max_pages)
		current_page = 1;
	else
		current_page++;

	//alert("HUD Lyrics: Flipped to page "+current_page);
	force_update = true;
	update_track();
}


function update_track()
{
	//alert("HUD Lyrics: Updating...");
	
	var current_title = shl.RegRead("HKEY_CURRENT_USER\\Software\\ZuneNowPlaying\\Title");
	var current_artist = shl.RegRead("HKEY_CURRENT_USER\\Software\\ZuneNowPlaying\\Artist");
	var current_album = shl.RegRead("HKEY_CURRENT_USER\\Software\\ZuneNowPlaying\\Album");
	
	var bg = document.getElementById("bg");
	/*
	var next = document.getElementById("img_next");
	next.src = "r_arrow-white-solid.png";
	next.opacity = 100;
	*/
	if(current_title == "" || current_artist == "")
	{
		alert("HUD Lyrics: No track title or artist detected.");

		bg.removeObjects();
		bg.addTextObject("[No lyrics available]", "Arial", 18, "white", 0, 0).opacity=30;
		document.getElementById("img_next").style.visibility = "hidden";
	}
	else
	{
		if(force_update || current_title != last_title || current_artist != last_artist || current_album != last_album)
		{
			if(!force_update)
				alert("HUD Lyrics: Now Playing: "+current_title+" by "+current_artist+" ("+current_album+")");

			last_title = current_title;
			last_artist = current_artist;
			last_album = current_album;

			bg.removeObjects();
			var title = bg.addTextObject(current_title+" by "+current_artist+" ("+current_album+")", "Arial", 18, "white", 0, 0).opacity=30;

			if(force_update)
				show_current_page();
			else
			{
				var data_url = "http://www.lyricsplugin.com/wmplayer03/plugin/?artist=" + current_artist + "&title=" + current_title;
				alert("HUD Lyrics: Getting lyrics data from "+data_url);

				$.get(data_url, function(lyrics_page) {
					alert("HUD Lyrics: Got lyrics data...");

					var start = lyrics_page.indexOf('<div id="lyrics">')+17;
					var end = lyrics_page.indexOf('</div>', start);
					lyrics = lyrics_page.slice(start, end).replace(/(<([^>]+)>)/ig,"");
					
					show_current_page();
				});
			}

			force_update = false;
		}
	}

	setTimeout("update_track()", 1000);
}


function show_current_page()
{
	alert("HUD Lyrics: Showing page "+current_page);

	//if it's too much text to display at once, break up into the pagination array, then display the current page
	var lines_per_page = 20;
	var lines = lyrics.split("\r");
	
	max_pages = Math.round(lines.length/lines_per_page);
	if(max_pages == 0)
		max_pages = 1;

	if(max_pages > 1)
	{
		document.getElementById("img_next").style.visibility = "visible";
		bg.addTextObject("["+current_page+"/"+max_pages+"]", "Arial", 14, "white", 0, 22).opacity=30;
	}
	else
		document.getElementById("img_next").style.visibility = "hidden";

	for(i=(current_page-1)*lines_per_page; i<current_page*lines_per_page; i++)
	{
		o = i-(current_page-1)*lines_per_page;
		bg.addTextObject(lines[i], "Arial", 18, "white", 0, 20+(20*o)).opacity=30;
	}

	//bg.addTextObject(lyrics, "Arial", 18, "white", 0, 20).opacity=30;
}