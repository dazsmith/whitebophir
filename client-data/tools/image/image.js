/**
 *                        WHITEBOPHIR
 *********************************************************
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2013  Ophir LOJKINE
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend
 */

(function () { //Code isolation
	var board = Tools.board;

	var input = document.createElement("input");
	input.id = "imageToolInput";
	input.type = "text";
	input.setAttribute("autocomplete", "off");

	var curImage = {
		"x": 0,
		"y": 0,
		"size": 36,
		"rawSize": 16,
		"oldSize": 0,
		"opacity": 1,
		"color": "#000",
		"id": 0,
		"sentText": "",
		"lastSending": 0
	};

	var active = false;


	function onStart() {
		curImage.oldSize = Tools.getSize();
		Tools.setSize(curImage.rawSize);
	}

	function onQuit() {
		stopEdit();
		Tools.setSize(curImage.oldSize);
	}

	function clickHandler(x, y, evt, isTouchEvent) {
		//if(document.querySelector("#menu").offsetWidth>Tools.menu_width+3) return;
		if (evt.target === input) return;
		if (evt.target.tagName === "image") {
			editOldImage(evt.target);
			evt.preventDefault();
			return;
		}
		curImage.rawSize = Tools.getSize();
		curImage.size = parseInt(curImage.rawSize * 1.5 + 12);
		curImage.opacity = Tools.getOpacity();
		curImage.color = Tools.getColor();
		curImage.x = x;
		curImage.y = y + curImage.size / 2;

		stopEdit();
		startEdit();
		evt.preventDefault();
	}

	function editOldImage(elem) {
		curImage.id = elem.id;
		var r = elem.getBoundingClientRect();
		var x = (r.left + document.documentElement.scrollLeft) / Tools.scale;
		var y = (r.top + r.height + document.documentElement.scrollTop) / Tools.scale;

		curImage.x = x;
		curImage.y = y;
		curImage.size = parseInt(elem.getAttribute("font-size"));
		curImage.opacity = parseFloat(elem.getAttribute("opacity"));
		curImage.color = elem.getAttribute("fill");
		startEdit();
		let txt = "";
		if (!(elem.getAttribute("class") === "DelibleImage")) txt = "IN";
		txt += "DELIBLE ";
		txt += elem.getAttribute("href");
		curImage.sentText = txt;
		input.value = txt;
	}

	function startEdit() {
		active = true;
		if (!input.parentNode) board.appendChild(input);
		input.value = "INDELIBLE ";
		curImage.sentText = "INDELIBLE ";
		var left = curImage.x - document.documentElement.scrollLeft + 'px';
		var clientW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		var x = curImage.x * Tools.scale - document.documentElement.scrollLeft;
		if (x + 250 > clientW) {
			x = Math.max(60, clientW - 260)
		}

		input.style.left = x + 'px';
		input.style.top = curImage.y * Tools.scale - document.documentElement.scrollTop + 20 + 'px';
		input.focus();
		input.addEventListener("keyup", textChangeHandler);
		input.addEventListener("blur", textChangeHandler);
		input.addEventListener("blur", blur);
	}

	function stopEdit() {
		try { input.blur(); } catch (e) { /* Internet Explorer */ }
		active = false;
		blur();
		curImage.id = 0;
		curImage.sentText = "";
		input.value = "";
		input.removeEventListener("keyup", textChangeHandler);
	}

	function blur() {
		if (active) return;
		input.style.top = '-1000px';
	}

	function textChangeHandler(evt) {
		if (evt.which === 13) { // enter
			curImage.y += 1.5 * curImage.size;
			stopEdit();
			startEdit();
		} else if (evt.which === 27) { // escape
			stopEdit();
		}
		if (performance.now() - curImage.lastSending > 1000) {
			if (curImage.sentText !== input.value) {
				//If the user clicked where there was no text, then create a new text field
				if (curImage.id === 0) {
					curImage.id = Tools.generateUID("i"); //"i" for image
					Tools.drawAndSend({
						'type': 'new',
						'id': curImage.id,
						'color': curImage.color,
						'size': curImage.size,
						'opacity': curImage.opacity,
						'x': curImage.x,
						'y': curImage.y
					})
				}
				let txtArray = input.value.slice(0,280).split(" ");
				let delible = false;
				if (txtArray[0] === "DELIBLE") delible = true;
				let txt = txtArray[1];
				if (txt && imageExistsAtURL(txt)) {
					Tools.drawAndSend({
						'type': "update",
						'id': curImage.id,
						'delible': delible,
						'txt': txt
					});
				}
				curImage.sentText = input.value;
				curImage.lastSending = performance.now();
			}
		} else {
			clearTimeout(curImage.timeout);
			curImage.timeout = setTimeout(textChangeHandler, 500, evt);
		}
	}

	function imageExistsAtURL(url) {
		var image = new Image;
		image.src = url;
		if (!image.width || image.width == 0) {
			return false;
		}
		return true;
	}

	function draw(data, isLocal) {
		Tools.drawingEvent = true;
		switch (data.type) {
			case "new":
				createImageField(data);
				break;
			case "update":
				var imageField = document.getElementById(data.id);
				if (imageField === null) {
					console.error("Text: Hmmm... I received text that belongs to an unknown text field");
					return false;
				}
				updateImage(imageField, data.txt, data.delible);
				break;
			default:
				console.error("Text: Draw instruction with unknown type. ", data);
				break;
		}
	}

	function updateImage(imageField, url, delible) {
		let imageClass = "IndelibleImage";
		if (delible) imageClass = "DelibleImage";
		imageField.setAttribute("class", imageClass);
		imageField.setAttribute("href", url);
		if (!url) imageField.removeAttribute("url");
	}

	function createImageField(fieldData) {
		var elem = Tools.createSVGElement("image");
		elem.id = fieldData.id;
		elem.setAttribute("x", fieldData.x);
		elem.setAttribute("y", fieldData.y);
		elem.setAttribute("class", "IndelibleImage");
		if (fieldData.delible) elem.setAttribute("class", "DelibleImage");
		elem.setAttribute("opacity", Math.max(0.1, Math.min(1, fieldData.opacity)) || 1);
		if (fieldData.txt) elem.setAttribute("href", fieldData.txt);
		Tools.drawingArea.appendChild(elem);
		return elem;
	}

	Tools.add({ //The new tool
		"name": "Image",
		"shortcut": "i",
		"listeners": {
			"press": clickHandler,
		},
		"onstart": onStart,
		"onquit": onQuit,
		"draw": draw,
		"stylesheet": "tools/image/image.css",
		"icon": "tools/image/icon.svg",
		"mouseCursor": "image"
	});

})(); //End of code isolation
