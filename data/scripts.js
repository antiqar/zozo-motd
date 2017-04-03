init();

function init() {
	plus_year = ( 1000 * 60 * 60 * 24 * 365 ) + Date.now();
	menu_a = document.querySelectorAll( '#menu a' );
	content_div = document.querySelector( '#content' );
	loading_div = document.querySelector( '#loading' );
	loading_img = loading_div.querySelector( 'img' );
	adv_div = document.querySelector( '#adv' );

	get_cookies();
	get_url_params();

	hook_adv();
	hook_menu();
	hook_lang_switch();

	if( isShowAdv() ) show_adv( true );
	else show_content();
}

function show_content() {
	if( config.vip ) {
		set_vip_link();
		set_face_image();
		show_box( menu_a[0] );
		show_loading( false );
	}
	else {
		menu_a[0].style.display = 'none';
		show_box( menu_a[1] );
	}
}

function show_loading( state ) {
	if( state === true )
	{
		loading_div.classList.remove( 'hide' );
		content_div.classList.add( 'hide' );
	}
	else {
		setTimeout( function () {
			var header = document.querySelector( '#header' );
			loading_div.classList.add( 'hide' );
			loading_div.style.top = '90px';
			header.classList.remove( 'hide' );
			content_div.classList.remove( 'up' );
			content_div.classList.remove( 'hide' );
		}, 600 );
	}
}

function show_adv( state ) {
	if( state === true )
	{
		show_adv_image();
	}
	else {
		setCookie( 'zozo_motd_adv_skip', '1', Date.parse( config.adv_end ) );
		adv_div.classList.add( 'hide' );
		show_loading( false );
	}
}

function show_adv_image() {
	var load_success = false;
	window.load_checker = setInterval( function() {
		if( !load_success) {
			show_adv( false );
			show_content();
		}
		clearInterval( window.load_checker );
	}, 5 * 1000 );
	load_adv_img( function () {
		var adv_img = adv_div.querySelector( 'img' );
		var adv_url = adv_div.querySelector( 'a' );
		adv_url.style.backgroundImage = 'url(' + config.adv_img + ')';
		adv_url.href = config.adv_url;
		vertical_align( adv_url );
		adv_div.classList.remove( 'hide' );
		load_success = true;
	});
}

function show_box( a_el ) {
	unset_active();
	a_el.classList.add( 'active' );

	var box_id = '#' + a_el.getAttribute( 'href' );
	document.querySelector( box_id ).classList.add( 'active' );

	if( box_id == '#server' ) {
		if( !config.ip_plain ) {
			show_loading( true );
			load_server_cfg( function( json_data ) {
				merge( config, json_data );
				show_box( a_el );
				show_loading( false );
			});
			return;
		}
		else
		{
			set_gametracker();
			set_discuss();
		}
	}

	switch_lang( box_id );
	calc_height( box_id );
}

function switch_lang( box_id ) {
	var box_el = document.querySelector( box_id );
	var menu_el = document.querySelector( '#menu' );
	var box_lang = box_el.dataset.lang;
	var menu_lang = menu_el.dataset.lang;
	var lang_el, phrase_data, phrase;

	if( menu_lang != config.lang ) {
		menu_el.dataset.lang = config.lang;
		lang_el = document.querySelectorAll( '#menu .lang-bind' );
		for( var i = 0; i < lang_el.length; i++ ) {
			phrase = lang_el[i].dataset.phrase;
			phrase_data = config.translation[config.lang][phrase];
			lang_el[i].innerText = phrase_data;
		}
	}

	if( box_lang != config.lang ) {
		box_el.dataset.lang = config.lang;
		lang_el = document.querySelectorAll( box_id + ' .lang-bind' );
		for( var i = 0; i < lang_el.length; i++ ) {
			phrase = lang_el[i].dataset.phrase;
			if( phrase == 'vip_list' ) {
				phrase_data = generate_list( config.translation[config.lang][phrase][config.vip] );
			}
			else if( phrase == 'server_list' ) {
				phrase_data = generate_list( config.translation[config.lang][phrase] );
			}
			else {
				phrase_data = config.translation[config.lang][phrase];
			}
			lang_el[i].innerHTML = phrase_data;
		}
	}
}

function generate_list( source_array ) {
	var list = '';
	for( var i = 0; i < source_array.length; i++ ) {
		list += '<li>' + source_array[i] + '</li>';
	}
	return list;
}

function hook_adv() {
	var adv_a = adv_div.querySelector( 'a' );
	var adv_close = adv_div.querySelector( '.close' );

	adv_a.addEventListener( 'click', function() {
		setCookie( 'zozo_motd_adv_skip', '1', Date.parse( config.adv_end ) );
	});

	adv_close.addEventListener( 'click', function( adv_a ) {
		adv_a.preventDefault();
		show_adv( false );
		show_content();
	});
}

function hook_menu() {
	for( var i = 0; i < menu_a.length; i++ ) {
		menu_a[i].addEventListener( 'click', function( e ) {
			e.preventDefault();
			if( !this.classList.contains( 'active' ) ) {
				show_box( this );
			}
		});
	}
}

function hook_lang_switch() {
	var lang_switch = document.querySelectorAll( '#lang img' );
	for( var i = 0; i < lang_switch.length; i++ ) {
		lang_switch[i].addEventListener( 'click', function() {
			config.lang = this.alt;
			setCookie( 'zozo_motd_lang', config.lang, plus_year );
			switch_lang( '#' + content_div.querySelector( '.active' ).id );
		});
	}
}

function unset_active() {
	var boxes = document.querySelectorAll( '.box' );
	for( var i = 0; i < menu_a.length; i++ ) {
		menu_a[i].classList.remove( 'active' );
		boxes[i].classList.remove( 'active' );
	}
}

function set_vip_link() {
	if( !config.hlxid ) return;
	var vip_link = document.querySelector( '#vip .big-btn' );
	vip_link.href = vip_link.getAttribute( 'href' ) + '?hlxid=' + config.hlxid;
}

function set_face_image() {
	var face_img = document.querySelector( '#face' );
	var random_number = Math.floor( Math.random() * config.face_max ) + 1;
	face_img.src = 'data/img/face-' + config.vip + '-' + random_number + '.gif';
}

function set_gametracker() {
	var gt = document.querySelector( '#gt' );
	if( gt.src ) return;
	gt.src = 'https://cache.gametracker.com/server_info/' + config.ip_plain + '/b_560_95_1.png';
	document.querySelector( '#ip' ).value = 'connect ' + config.ip_nice;
}

function set_discuss() {
	var discuss = document.querySelector( '#server .big-btn' );
	if( discuss.getAttribute( 'href' ) ) return;
	discuss.href = config.discuss_url ? config.discuss_url : 'https://zozo.gg/forum/';
}

function calc_height( box_id ) {
	if( !box_id ) {
		var box_el = content_div.querySelector( '.active' );
	}
	else {
		var box_el = document.querySelector( box_id );
	}

	var box_height = box_el.clientHeight;
	var desc_box = box_el.querySelector( '.description' );
	var content_height = content_div.clientHeight - 20;

	if( box_height >= content_height ) {
		var big_btn_height = box_el.querySelector( '.action' ).clientHeight;
		desc_box.style.height = ( content_height - big_btn_height ) + 'px';
	}
	else {
		desc_box.style.height = 'auto';
	}
}

function vertical_align( el ) {
	el.style.marginTop = ( el.parentElement.clientHeight - el.offsetHeight ) / 2 + 'px';
}

function get_cookies() {
	var c_lang = getCookie( 'zozo_motd_lang' );
	config.hlxid = getCookie( 'zozo_motd_hlxid' );
	config.adv_skip = getCookie( 'zozo_motd_adv_skip' );

	if( !c_lang ) {
		setCookie( 'zozo_motd_lang', config.lang, plus_year );
	}
	else {
		config.lang = c_lang;
	}
}

function get_url_params() {
	var data = {};
	if( location.search ) {
		var pair = ( location.search.substr( 1 ) ).split( '&' );
		for( var i = 0; i < pair.length; i++ ) {
			var param = pair[i].split( '=' );
			data[param[0]] = param[1];
		}
	}
	config.vip = data['vip'];
	config.server_cfg = 'data/cfg/' + data['srv'] + '.json';
}

function load_server_cfg( callback ) {
	var xhr = new XMLHttpRequest();
	xhr.overrideMimeType( 'application/json' );
	xhr.open( 'GET', config.server_cfg, true );
	xhr.onreadystatechange = function() {
		if( xhr.readyState === 4 && xhr.status == 200 ) {
			callback( JSON.parse( xhr.responseText ) );
		}
	}
	xhr.send();
}

function load_adv_img( callback ) {
	var dummy_image = document.createElement( 'img' );
	dummy_image.style.display = 'none';
	dummy_image.src = config.adv_img;
	document.body.appendChild( dummy_image );
	dummy_image.onload = function () {
		setTimeout( function() {
			document.body.removeChild( dummy_image );
			callback();
		}, 600 );
	}
}

function isShowAdv() {
	var adv_end = Date.parse( config.adv_end );
	if( config.adv_skip > 0 || Date.now() > adv_end ) {
		return false;
	}
	return true;
}

function setCookie( cname, cvalue, seconds ) {
	var d = new Date( seconds );
	document.cookie = cname + '=' + cvalue + ';path=/;' + 'expires=' + d.toGMTString();
}

function getCookie( cname ) {
	var name = cname + '=';
	var ca = document.cookie.split( ';' );
	for( var i = 0; i < ca.length; i++ ) {
		var c = ca[i].trim();
		if( c.indexOf( name ) == 0 ) return c.substring( name.length, c.length );
	}
	return '';
}

function merge( target, source ) {
	if( typeof target !== 'object' ) target = {};
	for( var property in source ) {
		if( source.hasOwnProperty( property ) ) {
			var sourceProperty = source[property];
			if( Array.isArray( sourceProperty ) ) {
				target[property] = sourceProperty;
			}
			else if( typeof sourceProperty === 'object' ) {
				target[property] = merge( target[property], sourceProperty );
			}
			else {
				target[property] = sourceProperty;
			}
		}
	}
	for( var a = 2, l = arguments.length; a < l; a++ ) {
		merge( target, arguments[a] );
	}

	return target;
}
