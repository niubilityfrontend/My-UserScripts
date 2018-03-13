// ==UserScript==
// @name         Kitsu Fansub Info
// @namespace    https://greasyfork.org/users/649
// @version      2.1.4
// @description  Show MAL fansub info on Kitsu anime pages
// @author       Adrien Pyke
// @match        *://kitsu.io/*
// @match        *://myanimelist.net/anime/*
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.rawgit.com/kufii/My-UserScripts/15a602c2a868c94a9477b34a8e2a37232c5e12c6/libs/gm_config.js
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// ==/UserScript==

/*

Evil Icons
https://github.com/evil-icons/evil-icons

Copyright (c) 2014 Alexander Madyankin <alexander@madyankin.name>, Roman Shamin

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(() => {
	'use strict';

	const SCRIPT_NAME = 'Kitsu Fansub Info';
	const API = 'https://kitsu.io/api/edge';
	const REGEX = /^https?:\/\/kitsu\.io\/anime\/([^/]+)\/?(?:\?.*)?$/;
	const SECTION_ID = 'kitsu-fansubs';

	const Icon = {
		extLink: '<path d="M38.288 10.297l1.414 1.415-14.99 14.99-1.414-1.414z"/><path d="M40 20h-2v-8h-8v-2h10z"/><path d="M35 38H15c-1.7 0-3-1.3-3-3V15c0-1.7 1.3-3 3-3h11v2H15c-.6 0-1 .4-1 1v20c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V24h2v11c0 1.7-1.3 3-3 3z"/>',
		link: '<path d="M24 30.2c0 .2.1.5.1.8 0 1.4-.5 2.6-1.5 3.6l-2 2c-1 1-2.2 1.5-3.6 1.5-2.8 0-5.1-2.3-5.1-5.1 0-1.4.5-2.6 1.5-3.6l2-2c1-1 2.2-1.5 3.6-1.5.3 0 .5 0 .8.1l1.5-1.5c-.7-.3-1.5-.4-2.3-.4-1.9 0-3.6.7-4.9 2l-2 2c-1.3 1.3-2 3-2 4.9 0 3.8 3.1 6.9 6.9 6.9 1.9 0 3.6-.7 4.9-2l2-2c1.3-1.3 2-3 2-4.9 0-.8-.1-1.6-.4-2.3L24 30.2z"/><path d="M33 10.1c-1.9 0-3.6.7-4.9 2l-2 2c-1.3 1.3-2 3-2 4.9 0 .8.1 1.6.4 2.3l1.5-1.5c0-.2-.1-.5-.1-.8 0-1.4.5-2.6 1.5-3.6l2-2c1-1 2.2-1.5 3.6-1.5 2.8 0 5.1 2.3 5.1 5.1 0 1.4-.5 2.6-1.5 3.6l-2 2c-1 1-2.2 1.5-3.6 1.5-.3 0-.5 0-.8-.1l-1.5 1.5c.7.3 1.5.4 2.3.4 1.9 0 3.6-.7 4.9-2l2-2c1.3-1.3 2-3 2-4.9 0-3.8-3.1-6.9-6.9-6.9z"/><path d="M20 31c-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l10-10c.4-.4 1-.4 1.4 0s.4 1 0 1.4l-10 10c-.2.2-.4.3-.7.3z"/>',
		minus: '<path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z"/><path d="M16 24h18v2H16z"/>',
		plus: '<path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z"/><path d="M16 24h18v2H16z"/><path d="M24 16h2v18h-2z"/>',
		thumbsUp: '<path d="M40 23.2c0-2.1-1.7-3.2-4-3.2h-6.7c.5-1.8.7-3.5.7-5 0-5.8-1.6-7-3-7-.9 0-1.6.1-2.5.6-.3.2-.4.4-.5.7l-1 5.4c-1.1 2.8-3.8 5.3-6 7V36c.8 0 1.6.4 2.6.9 1.1.5 2.2 1.1 3.4 1.1h9.5c2 0 3.5-1.6 3.5-3 0-.3 0-.5-.1-.7 1.2-.5 2.1-1.5 2.1-2.8 0-.6-.1-1.1-.3-1.6.8-.5 1.5-1.4 1.5-2.4 0-.6-.3-1.2-.6-1.7.8-.6 1.4-1.6 1.4-2.6zm-2.1 0c0 1.3-1.3 1.4-1.5 2-.2.7.8.9.8 2.1 0 1.2-1.5 1.2-1.7 1.9-.2.8.5 1 .5 2.2v.2c-.2 1-1.7 1.1-2 1.5-.3.5 0 .7 0 1.8 0 .6-.7 1-1.5 1H23c-.8 0-1.6-.4-2.6-.9-.8-.4-1.6-.8-2.4-1V23.5c2.5-1.9 5.7-4.7 6.9-8.2v-.2l.9-5c.4-.1.7-.1 1.2-.1.2 0 1 1.2 1 5 0 1.5-.3 3.1-.8 5H27c-.6 0-1 .4-1 1s.4 1 1 1h9c1 0 1.9.5 1.9 1.2z"/><path d="M16 38h-6c-1.1 0-2-.9-2-2V22c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2zm-6-16v14h6V22h-6z"/>'
	};

	const Util = {
		log(...args) {
			args.unshift(`%c${SCRIPT_NAME}:`, 'font-weight: bold;color: #233c7b;');
			console.log(...args);
		},
		q(query, context = document) {
			return context.querySelector(query);
		},
		qq(query, context = document) {
			return Array.from(context.querySelectorAll(query));
		},
		getQueryParameter(name, url = location.href) {
			name = name.replace(/[[\]]/g, '\\$&');
			let regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, ' '));
		},
		setQueryParameter(key, value, url = location.href) {
			let re = new RegExp(`([?&])${key}=.*?(&|#|$)(.*)`, 'gi'),
				hash;

			if (re.test(url)) {
				if (typeof value !== 'undefined' && value !== null) return url.replace(re, `$1${key}=${value}$2$3`);
				else {
					hash = url.split('#');
					url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
					if (typeof hash[1] !== 'undefined' && hash[1] !== null) url += `#${hash[1]}`;
					return url;
				}
			} else if (typeof value !== 'undefined' && value !== null) {
				let separator = url.indexOf('?') !== -1 ? '&' : '?';
				hash = url.split('#');
				url = `${hash[0] + separator + key}=${value}`;
				if (typeof hash[1] !== 'undefined' && hash[1] !== null) url += `#${hash[1]}`;
				return url;
			} else return url;
		},
		setNewTab(node) {
			node.setAttribute('target', '_blank');
			node.setAttribute('rel', 'noopener noreferrer');
		},
		icon(name, color, size, scale) {
			let newIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			newIcon.innerHTML = Icon[name];
			newIcon.setAttribute('viewBox', '0 0 50 50');
			newIcon.setAttribute('width', '20');
			newIcon.setAttribute('height', '20');
			if (color) newIcon.setAttribute('fill', color);
			if (size) { newIcon.setAttribute('width', size); newIcon.setAttribute('height', size); }
			if (scale) newIcon.setAttribute('transform', `scale(${scale[0]}, ${scale[1]})`);
			return newIcon;
		},
		createModal(title, bodyDiv) {
			let div = document.createElement('div');
			let modal = document.createElement('div');
			modal.classList.add('modal');
			modal.style.display = 'block';
			modal.style.overflowY = 'auto';
			div.appendChild(modal);
			let backdrop = document.createElement('div');
			backdrop.classList.add('modal-backdrop', 'fade', 'in');
			div.appendChild(backdrop);
			let dialog = document.createElement('div');
			dialog.classList.add('modal-dialog');
			modal.appendChild(dialog);
			let content = document.createElement('div');
			content.classList.add('modal-content');
			dialog.appendChild(content);
			let header = document.createElement('div');
			header.classList.add('modal-header');
			content.appendChild(header);
			let body = document.createElement('div');
			body.classList.add('modal-body');
			content.appendChild(body);
			let wrapper = document.createElement('div');
			wrapper.classList.add('modal-wrapper');
			body.appendChild(wrapper);

			let h4 = document.createElement('h4');
			h4.classList.add('modal-title');
			h4.textContent = title;
			header.appendChild(h4);

			wrapper.appendChild(bodyDiv);

			div.onclick = e => {
				if (e.target === modal || e.target === backdrop) {
					div.remove();
				}
			};
			document.body.appendChild(div);
		}
	};

	const App = {
		fansubCache: {},
		websiteCache: {},
		votingTabs: {},
		getKitsuInfo(id, cb) {
			// Util.log('Loading Kitsu info...');
			GM_xmlhttpRequest({
				method: 'GET',
				url: `${API}/anime?filter[slug]=${id}&include=mappings`,
				headers: {
					'Accept': 'application/vnd.api+json'
				},
				onload(response) {
					Util.log('Loaded Kitsu info.');
					cb(JSON.parse(response.responseText));
				},
				onerror() {
					Util.log('Error loading Kitsu info.');
				}
			});
		},
		getMALFansubInfo(malid, cb) {
			// Util.log('Loading MAL info...');
			let url = `https://myanimelist.net/anime/${malid}`;
			GM_xmlhttpRequest({
				method: 'GET',
				url,
				onload(response) {
					Util.log('Loaded MAL info.');
					let tempDiv = document.createElement('div');
					tempDiv.innerHTML = response.responseText;

					let fansubDiv = Util.q('#inlineContent', tempDiv);
					if (fansubDiv) {
						fansubDiv = fansubDiv.parentNode;
						let fansubs = Util.qq('.spaceit_pad', fansubDiv).filter(node => {
							// only return nodes without an id
							return !node.id;
						}).map(node => {
							let id = Util.q('a:nth-of-type(1)', node).dataset.groupId;
							let link = Util.q('a:nth-of-type(4)', node);
							let tagNode = Util.q('small:nth-of-type(1)', node);
							let tag = (tagNode && tagNode.textContent !== '[]') ? tagNode.textContent : null;
							let langNode = Util.q('small:nth-of-type(2)', node);
							let lang = (langNode) ? langNode.textContent.substring(1, langNode.textContent.length - 1) : null;
							let voteUpButton = Util.q(`#good${id}`, node);
							let voteDownButton = Util.q(`#bad${id}`, node);
							let approvalNode = Util.q('a:nth-of-type(5) > small', node);
							let totalApproved = 0;
							let totalVotes = 0;
							let comments = [];
							if (approvalNode) {
								let match = approvalNode.textContent.match(/([0-9]+)[^0-9]*([0-9]+)/);
								if (match) {
									totalApproved = match[1];
									totalVotes = match[2];
									comments = Util.qq(`#fsgComments${id} > .spaceit`, node).map(comment => {
										return {
											text: comment.textContent,
											approves: !comment.hasAttribute('style')
										};
									});
								}
							}
							let value = 3;
							if (voteUpButton.src.match('good-on.gif$')) {
								value = 1;
							} else if (voteDownButton.src.match('bad-on.gif$')) {
								value = 2;
							}
							return {
								id,
								malid,
								name: link.textContent,
								url: `https://myanimelist.net${link.pathname}${link.search}`,
								tag,
								lang,
								totalVotes,
								totalApproved,
								value,
								comments
							};
						});
						cb({
							url: `${url}#inlineContent`,
							fansubs
						});
					} else {
						alert('Failed to get MAL Fansub info. Please make sure you\'re logged into myanimelist.net.');
					}
				},
				onerror() {
					Util.log('Error loading MAL info.');
				}
			});
		},
		getFansubs(id, cb) {
			let self = this;
			if (self.fansubCache[id]) {
				cb(self.fansubCache[id]);
				return;
			}
			self.getKitsuInfo(id, anime => {
				let mal_id;
				if (anime.included) {
					for (let i = 0; i < anime.included.length; i++) {
						if (anime.included[i].attributes.externalSite === 'myanimelist/anime') {
							mal_id = anime.included[i].attributes.externalId;
						}
					}
				}
				if (mal_id) {
					self.getMALFansubInfo(mal_id, fansubs => {
						self.fansubCache[id] = fansubs;
						cb(fansubs);
					});
				} else {
					Util.log('MAL ID not found');
					let section = Util.q(`#${SECTION_ID}`);
					if (section) section.remove();

				}
			});
		},
		getWebsite(id, cb) {
			// Util.log('Getting website for ' + id);
			let self = this;
			if (self.websiteCache[id]) {
				cb(self.websiteCache[id]);
				return;
			}
			GM_xmlhttpRequest({
				method: 'GET',
				url: `https://myanimelist.net/fansub-groups.php?id=${id}`,
				onload(response) {
					let tempDiv = document.createElement('div');
					tempDiv.innerHTML = response.responseText;
					let link = Util.q('td.borderClass > a:first-of-type', tempDiv);
					if (link && link.getAttribute('href')) {
						// Util.log('Found website for id');
						self.websiteCache[id] = link.href;
						cb(link.href);
					}
				}
			});
		},
		getFansubSection() {
			let container = document.createElement('section');
			container.classList.add('m-b-1');
			container.id = SECTION_ID;

			let title = document.createElement('h5');
			title.id = 'fansubs-title';
			title.textContent = 'Fansubs';
			container.appendChild(title);

			let list = document.createElement('ul');
			list.classList.add('media-list');
			list.classList.add('w-100');
			container.appendChild(list);

			return container;
		},
		vote(malid, groupid, value, comment) {
			if (App.votingTabs.malid) {
				App.votingTabs.malid.close();
				App.votingTabs.malid = null;
			}
			let url = `https://myanimelist.net/anime/${malid}`;
			url = Util.setQueryParameter('US_VOTE', true, url);
			url = Util.setQueryParameter('groupid', groupid, url);
			url = Util.setQueryParameter('value', value, url);
			url = Util.setQueryParameter('comment', comment, url);
			App.votingTabs.malid = GM_openInTab(url, true);
			App.votingTabs.malid.onbeforeunload = () => {
				App.votingTabs.malid = null;
			};
		},
		getFansubOutput(fansub) {
			let fansubDiv = document.createElement('div');
			fansubDiv.classList.add('stream-item');
			fansubDiv.classList.add('row');

			let streamWrap = document.createElement('div');
			streamWrap.classList.add('stream-item-wrapper');
			streamWrap.classList.add('stream-review-wrapper');
			streamWrap.classList.add('col-sm-12');
			fansubDiv.appendChild(streamWrap);

			let streamReview = document.createElement('div');
			streamReview.classList.add('stream-review');
			streamReview.classList.add('row');
			streamWrap.appendChild(streamReview);

			let streamActivity = document.createElement('div');
			streamActivity.classList.add('stream-item-activity');
			streamWrap.appendChild(streamActivity);

			let streamOptions = document.createElement('div');
			streamOptions.classList.add('stream-item-options');
			streamWrap.appendChild(streamOptions);

			let streamContent = document.createElement('div');
			streamContent.classList.add('stream-review-content');
			streamReview.appendChild(streamContent);

			let heading = document.createElement('small');
			heading.classList.add('media-heading');
			streamContent.appendChild(heading);

			let name = document.createElement('h6');
			heading.appendChild(name);

			let nameLink = document.createElement('a');
			nameLink.textContent = fansub.name;
			nameLink.href = fansub.url;
			Util.setNewTab(nameLink);
			name.appendChild(nameLink);

			if (fansub.lang) {
				let lang = document.createElement('small');
				lang.textContent = ` ${fansub.lang}`;
				name.appendChild(lang);
			}

			App.getWebsite(fansub.id, href => {
				let webLink = document.createElement('a');
				webLink.href = href;
				Util.setNewTab(webLink);
				webLink.appendChild(document.createTextNode(' '));
				webLink.appendChild(Util.icon('link')).setAttribute('style', 'vertical-align: sub');
				name.appendChild(webLink);
			});

			let votingButtons = document.createElement('div');
			votingButtons.setAttribute('style', 'display:inline-block;float:left;padding:2px 0 4px;position:relative;');
			let voteUp = document.createElement('a');
			let voteDown = document.createElement('a');
			votingButtons.appendChild(voteUp);
			votingButtons.appendChild(voteDown);
			streamActivity.appendChild(votingButtons);
			voteUp.href = '#';
			voteDown.href = '#';
			voteUp.dataset.value = 1;
			voteDown.dataset.value = 2;

			if (fansub.value === 1) {
				voteUp.appendChild(Util.icon('thumbsUp', '#16A085')).setAttribute('style', 'width:23px;height:auto;float:left;');
				voteDown.appendChild(Util.icon('thumbsUp', '#B4B4B4', '', [-1, -1])).setAttribute('style', 'width:23px;height:auto;float:left;');
			} else if (fansub.value === 2) {
				voteUp.appendChild(Util.icon('thumbsUp', '#B4B4B4')).setAttribute('style', 'width:23px;height:auto;float:left;');
				voteDown.appendChild(Util.icon('thumbsUp', '#DB2409', '', [-1, -1])).setAttribute('style', 'width:23px;height:auto;float:left;');
			} else {
				voteUp.appendChild(Util.icon('thumbsUp', '#B4B4B4')).setAttribute('style', 'width:23px;height:auto;float:left;');
				voteDown.appendChild(Util.icon('thumbsUp', '#B4B4B4', '', [-1, -1])).setAttribute('style', 'width:23px;height:auto;float:left;');
			}

			let voteHandler = e => {
				e.preventDefault();
				let clickedNode = e.target;
				if (clickedNode.nodeName === 'svg') {
					clickedNode = clickedNode.parentNode;
				} else if (clickedNode.nodeName === 'path') {
					clickedNode = clickedNode.parentNode.parentNode;
				}
				let value = parseInt(clickedNode.dataset.value);
				if (value === fansub.value) {
					value = 3;
				}
				App.vote(fansub.malid, fansub.id, value);
				fansub.value = value;
				voteUp.innerHTML = voteDown.innerHTML = '';

				if (fansub.value === 1) {
					voteUp.appendChild(Util.icon('thumbsUp', '#16A085')).setAttribute('style', 'width:23px;height:auto;float:left;');
					voteDown.appendChild(Util.icon('thumbsUp', '#B4B4B4', '', [-1, -1])).setAttribute('style', 'width:23px;height:auto;float:left;');
				} else if (fansub.value === 2) {
					voteUp.appendChild(Util.icon('thumbsUp', '#B4B4B4')).setAttribute('style', 'width:23px;height:auto;float:left;');
					voteDown.appendChild(Util.icon('thumbsUp', '#DB2409', '', [-1, -1])).setAttribute('style', 'width:23px;height:auto;float:left;');
				} else {
					voteUp.appendChild(Util.icon('thumbsUp', '#B4B4B4')).setAttribute('style', 'width:23px;height:auto;float:left;');
					voteDown.appendChild(Util.icon('thumbsUp', '#B4B4B4', '', [-1, -1])).setAttribute('style', 'width:23px;height:auto;float:left;');
				}
			};
			voteUp.onclick = voteHandler;
			voteDown.onclick = voteHandler;

			let approvals = document.createElement('div');
			approvals.classList.add('comment-body');
			approvals.textContent = `${fansub.totalApproved} of ${fansub.totalVotes} users approve.`;
			streamContent.appendChild(approvals);

			if (fansub.comments && fansub.comments.length > 0) {
				let commentsWrap = document.createElement('span');
				commentsWrap.classList.add('more-wrapper');
				streamOptions.appendChild(commentsWrap);
				let commentsLink = document.createElement('a');
				commentsLink.classList.add('more-drop');
				commentsLink.href = '#';
				commentsLink.textContent = 'Comments...';
				commentsWrap.appendChild(commentsLink);
				commentsLink.onclick = e => {
					e.preventDefault();
					let commentsDiv = document.createElement('div');
					fansub.comments.forEach(comment => {
						let div = document.createElement('div');
						div.classList.add('author-header');

						let smileContainer = document.createElement('div');
						smileContainer.classList.add('review-avatar');
						smileContainer.setAttribute('style', 'margin-right: 0');
						div.appendChild(smileContainer);
						smileContainer.appendChild(comment.approves ? Util.icon('plus', '#16A085', 25) : Util.icon('minus', '#DB2409', 25));

						let commentContainer = document.createElement('div');
						commentContainer.classList.add('comment-body');
						commentContainer.setAttribute('style', 'margin-left: 40px');
						div.appendChild(commentContainer);
						let commentText = document.createElement('p');
						commentText.textContent = comment.text;
						commentContainer.appendChild(commentText);

						commentsDiv.appendChild(div);
					});
					Util.q('.author-header:last-child', commentsDiv).setAttribute('style', 'border-bottom: none;');
					Util.createModal(fansub.name, commentsDiv);
					return false;
				};
			}

			return fansubDiv;
		},
		filterFansubs(fansubs, langs) {
			langs = langs.split(',').map(lang => {
				return lang.trim().toLowerCase();
			});
			return fansubs.filter(({ lang }) => {
				lang = (lang || 'english').trim().toLowerCase();
				return langs.includes(lang);
			});
		}
	};

	const Config = GM_config([
		{
			key: 'lang',
			label: 'Languages (Comma Seperated)',
			type: 'text'
		}
	]);

	if (location.hostname === 'kitsu.io') {
		GM_registerMenuCommand('Kitsu Fansub Info Settings', Config.setup);

		let cfg = Config.load();
		waitForUrl(REGEX, () => {
			waitForElems({
				sel: '.media-container > .row > .col-sm-8',
				stop: true,
				onmatch(container) {
					let reviews = Util.qq('section.m-b-1', container)[1];

					let section = Util.q(`#${SECTION_ID}`, container);
					if (section) section.remove();
					section = App.getFansubSection();
					reviews.parentNode.insertBefore(section, reviews.nextSibling);

					let slug = location.href.match(REGEX)[1];
					let url = location.href;
					App.getFansubs(slug, response => {
						if (location.href === url) {
							if (cfg.lang) {
								response.fansubs = App.filterFansubs(response.fansubs, cfg.lang);
							}

							let extLink = Util.q('h5#fansubs-title', section);
							let malLink = document.createElement('a');
							malLink.href = response.url;
							Util.setNewTab(malLink);
							extLink.appendChild(malLink);
							malLink.appendChild(Util.icon('extLink')).setAttribute('style', 'vertical-align: sub');

							let list = Util.q('.media-list', section);

							if (response.fansubs.length > 0) {
								let hiddenSpan = document.createElement('span');
								hiddenSpan.style.display = 'none';
								let addViewMore = false;

								response.fansubs.forEach((fansub, i) => {
									let fansubDiv = App.getFansubOutput(fansub);
									if (i < 4) {
										list.appendChild(fansubDiv);
									} else {
										hiddenSpan.appendChild(fansubDiv);
										addViewMore = true;
									}
								});

								if (addViewMore) {
									list.appendChild(hiddenSpan);
									let viewMoreDiv = document.createElement('div');
									viewMoreDiv.classList.add('text-xs-center');
									viewMoreDiv.classList.add('w-100');

									let viewMore = document.createElement('a');
									viewMore.classList.add('button');
									viewMore.classList.add('button--secondary');
									viewMore.setAttribute('style', 'color: #FFF;');
									viewMore.href = '#';
									viewMore.textContent = 'View More Fansubs';
									viewMoreDiv.appendChild(viewMore);

									viewMore.onclick = e => {
										e.preventDefault();
										if (hiddenSpan.style.display === 'none') {
											hiddenSpan.style.display = 'inline';
											viewMore.textContent = 'View Less Fansubs';
										} else {
											hiddenSpan.style.display = 'none';
											viewMore.textContent = 'View More Fansubs';
										}
										return false;
									};

									list.appendChild(viewMoreDiv);
								}
							} else {
								let p = document.createElement('p');
								p.textContent = 'No fansubs found.';
								p.style.textAlign = 'center';
								p.style.marginTop = '5px';
								list.appendChild(p);
							}
						}
					});
				}
			});
		});
	} else if (Util.getQueryParameter('US_VOTE')) {
		let groupid = Util.getQueryParameter('groupid');
		let value = Util.getQueryParameter('value');
		let comment = Util.getQueryParameter('comment');
		let button = Util.q(`.js-fansub-set-vote-button[data-type="${value}"][data-group-id="${groupid}"]`);
		button.click();
		if (value === '3') {
			setTimeout(window.close, 0);
		} else {
			waitForElems({
				sel: '#fancybox-inner',
				stop: true,
				onmatch(node) {
					let commentBox = Util.q('#fsgcomm', node);
					let submit = Util.q('.js-fansub-comment-button', node);
					commentBox.value = comment;
					setTimeout(() => {
						Util.log(submit);
						submit.click();
						setTimeout(window.close, 0);
					}, 300);
				}
			});
		}
	}
})();
