'use strict'

const fs        = require('fs')
const path      = require('path')
const shelljs   = require('shelljs')
const { JSDOM } = require('jsdom')
const config    = require('./gulp.config')

const appendModule = (element, wrapper, module) => {
	element.parentNode.insertBefore(wrapper, element)
	element.remove()
	wrapper.innerHTML = module
}

const parseRichText = (document, configs, elements) => {
	let final = ''

	elements.forEach(element => {
		const content = element.innerHTML,
			name = element.getAttribute('data-name'),
			label = element.getAttribute('data-label')

		element.removeAttribute('data-hs')
		element.removeAttribute('data-name')
		element.removeAttribute('data-label')

		// element.textContent = element.textContent.replace(/'/g, '&#39;')
		
		let module = configs.modules.rich_text.content
			.replace(configs.modules.rich_text.props.name, name)
			.replace(configs.modules.rich_text.props.label, label)
			.replace(configs.modules.rich_text.props.html, element.outerHTML)

		let wrapper = document.createElement('div')
		appendModule(element, wrapper, module)

		final = document.documentElement.outerHTML
	})

	return final
}

const parseImage = (document, configs, elements) => {
	let final = ''

	elements.forEach(element => {
		const content = element.innerHTML,
			name = element.getAttribute('data-name'),
			label = element.getAttribute('data-label'),
			alt = element.getAttribute('alt'),
			src = element.getAttribute('src')

		element.removeAttribute('data-hs')
		element.removeAttribute('data-name')
		element.removeAttribute('data-label')

		let module = configs.modules.image.content
			.replace(configs.modules.image.props.name, name)
			.replace(configs.modules.image.props.label, label)
			.replace(configs.modules.image.props.alt, alt)
			.replace(configs.modules.image.props.src, src)
			.replace(configs.modules.image.props.html, element.outerHTML)

		let wrapper = document.createElement('div')
		appendModule(element, wrapper, module)

		final = document.documentElement.outerHTML
	})

	return final
}

const parseForm = (document, configs, elements) => {
	let final = ''

	elements.forEach(element => {
		const content = element.innerHTML,
			name = element.getAttribute('data-name'),
			label = element.getAttribute('data-label'),
			custom = element.getAttribute('data-custom_form_html')

		element.removeAttribute('data-hs')
		element.removeAttribute('data-name')
		element.removeAttribute('data-label')
		element.removeAttribute('data-custom_form_html')

		let module = configs.modules.form.content
			.replace(configs.modules.form.props.name, name)
			.replace(configs.modules.form.props.label, label)
			.replace(configs.modules.form.props.custom_form_html, custom)

		let wrapper = document.createElement('div')
		appendModule(element, wrapper, module)

		final = document.documentElement.outerHTML
	})

	return final
}

const parseSimpleText = (document, configs, elements) => {
	let final = ''

	elements.forEach(element => {
		const content = element.innerHTML,
			name = element.getAttribute('data-name'),
			field = element.getAttribute('data-field')

		element.removeAttribute('data-hs')
		element.removeAttribute('data-name')
		element.removeAttribute('data-field')

		element.innerHTML = element.innerHTML.replace(/'/g, '&#39;')

		let module = configs.modules.text.content
			.replace(configs.modules.text.props.name, name)
			.replace(configs.modules.text.props.field, field)
			.replace(configs.modules.text.props.value, element.innerHTML)

		let wrapper = document.createElement('div')
		appendModule(element, wrapper, module)

		final = document.documentElement.outerHTML
	})

	return final
}

const parseHead = (document) => {
	document.head.querySelector('title').innerHTML = '{{ content.html_title }}'

	if(document.head.querySelector('meta[name="description"]'))
		document.head.querySelector('meta[name="description"]').setAttribute('content', '{{ content.meta_description }}')

	document.head.append('{{ standard_header_includes }}')

	if(document.head.querySelectorAll('link[rel="stylesheet"]')){
		document.head.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
			link.setAttribute('data-turbolinks-track', 'true')
			link.setAttribute('media', 'all')

			let href = link.getAttribute('href'),
				file = href.substr(href.indexOf('/') + 1, href.length)

			link.setAttribute('href', '{{ get_public_template_url("Custom/page/${file}") }}')
		})
	}

	return document.documentElement.outerHTML
}

const parseScripts = (document) => {
	let final = ''

	document.body.append('{{ standard_footer_includes }}')

	return final
}

const parseEmptyTags = (document) => {
	Array.from(document.body.getElementsByTagName('*')).forEach(element => {
		if(element.innerHTML === '' && element.tagName.toLowerCase() !== 'script')
			element.innerHTML += '&nbsp;'
	})
}

const createParsedTemplate = (templatePath, parsedHTML) => {
	const fixPath = templatePath.replace('/clean-templates', '/hubspot-templates'),
		distPath = path.dirname(fixPath)

	if(!fs.existsSync(distPath))
		shelljs.mkdir('-p', distPath)

	let stream = fs.createWriteStream(fixPath)
	stream.once('open', fd => {
		stream.write(parsedHTML)
		stream.end()
	})

	return fixPath
}

/* parser */
const parser = (templatePath, configs) => {
	const rawHTML = fs.readFileSync(templatePath, 'utf8'),
		jsdomHTML = new JSDOM(rawHTML)

	let { document } = jsdomHTML.window,
		parsedHTML = '',
		links = document.querySelectorAll('a')

	if(links)
		links.forEach(link => link.classList.add('hs-skip-lang-url-rewrite'))

	parsedHTML = parseEmptyTags(document)

	if (document.querySelectorAll('[data-hs="rich"]').length > 0)
		parsedHTML = '<!DOCTYPE html>' + parseRichText(document, configs, document.querySelectorAll('[data-hs="rich"]'))
	else parsedHTML = document.documentElement.outerHTML

	if (document.querySelectorAll('[data-hs="image"]').length > 0)
		parsedHTML = '<!DOCTYPE html>' + parseImage(document, configs, document.querySelectorAll('[data-hs="image"]'))
	else parsedHTML = document.documentElement.outerHTML

	if (document.querySelectorAll('[data-hs="form"]').length > 0)
		parsedHTML = '<!DOCTYPE html>' + parseForm(document, configs, document.querySelectorAll('[data-hs="form"]'))
	else parsedHTML = document.documentElement.outerHTML

	if (document.querySelectorAll('[data-hs="text"]').length > 0)
		parsedHTML = '<!DOCTYPE html>' + parseSimpleText(document, configs, document.querySelectorAll('[data-hs="text"]'))
	else parsedHTML = document.documentElement.outerHTML

	parsedHTML = '<!DOCTYPE html>' + parseHead(document)
	// parsedHTML = parseScripts(document)

	return createParsedTemplate(templatePath, parsedHTML)
}

module.exports = parser
