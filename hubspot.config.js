'use strict'

const hubspot = {
	modules: {
		text: {
			props: {
				name: '%name%',
				field: '%field%',
				value: '%value%'
			},
			content: '{% text "%name%" field="%field%" value="%value%" %}'
		},
		
		image: {
			props: {
				name: '%name%',
				label: '%label%',
				alt: '%alt%',
				src: '%src%'
			},
			content: '{% image "%name%" label="%label%", alt="%alt%", src="%src%" %}'
		},

		rich_text: {
			props: {
				name: '%name%',
				label: '%label%',
				html: '%html%'
			},
			content: '{% rich_text "%name%" label="%label%" html=\'%html%\' %}'
		},

		form: {
			props: {
				name: '%name%',
				label: '%label%',
				custom_form_html: '%custom_form_html%'
			},
			content: '{% form "%name%" label="%label%", custom_form_html=%custom_form_html% %}'
		}
	}
}

module.exports = hubspot
