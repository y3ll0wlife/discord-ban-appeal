import { CONFIG_HTML, WEBSITE_CONFIG } from "../config";
import { OAUTH_URL } from "../config";
import { User } from "../types/discord";
import { generateAvatarUrl } from "./discord";

export function generateHTMLFromConfig() {
	const html: string[] = [`<form action="/submit" method="post" class="col-lg-6 offset-lg-3" id="appealform"> `, `<div class="row justify-content-center">`];

	for (let conf of CONFIG_HTML) {
		html.push(`<div>`);
		switch (conf.type) {
			case "text":
				html.push(`<label for="${conf.key}" class="form-label">${conf.label}</label>`);
				html.push(`<input type="text" class="form-control" id="${conf.key}" name="${conf.key}" ${conf.required ? "required" : ""}/>`);
				break;

			case "textarea":
				html.push(`<label for="${conf.key}" class="form-label">${conf.label}</label>`);
				html.push(`<textarea type="text" class="form-control" id="${conf.key}" style="height: 100px" name="${conf.key}" ${conf.required ? "required" : ""}></textarea>`);
				break;

			case "select":
				if (conf.selectInputs && conf.selectInputs?.length > 0) {
					html.push(`<label for="${conf.key}" class="form-label">${conf.label}</label>`);
					html.push(`<select class="form-select" id="${conf.key}" name="${conf.key}" form="appealform">`);
					for (let input of conf.selectInputs) {
						html.push(`<option value="${input.value}">${input.text}</option>`);
					}
					html.push(`</select>`);
				}
				break;

			case "range":
				if (!conf.rangeInput) break;
				html.push(`<label for="${conf.key}" class="form-label">${conf.label} (${conf.rangeInput.min}-${conf.rangeInput.max}) [${conf.rangeInput.step} steps]</label>`);
				html.push(`<input type="range" class="form-range" id="${conf.key}" name="${conf.key}" min="${conf.rangeInput.min}" max="${conf.rangeInput.max}" step="${conf.rangeInput.step ?? 1}">`);
				break;

			case "checkbox": {
				if (conf.checkboxInput && conf.checkboxInput?.length > 0) {
					html.push(`<div> <label>${conf.label}</label> <ul>`);
					for (let box of conf.checkboxInput) {
						html.push(`
						<li>
							<input id="${conf.key}" type="checkbox" name="${conf.key}" value="${box.value}" />
							<label for="${conf.key}">${box.text}</label>
					  	</li>
					  `);
					}
					html.push(`</ul></div>`);
				}
				break;
			}
		}
		html.push(`</div>`);
	}

	html.push(`<button type="submit" class="btn btn-primary">Submit</button>`);
	html.push(`</div>`);
	html.push(`</form>`);

	return html;
}

export const landingPage: string = `
<h1 class="text-center mt-4"> ${WEBSITE_CONFIG.landingText} </h1>
<h3 class="text-center"> ${WEBSITE_CONFIG.landingTextDescription} </h3>
<button type="button" class="btn btn-primary position-absolute top-50 start-50 translate-middle" ><a href="${OAUTH_URL}" style="text-decoration: none; color: white"> Login </a></button>
`;

export const appealForm = (user: User) => `
<img src="${generateAvatarUrl(user.id, user.discriminator, user.avatar)}" class="mx-auto d-block mt-5" style="border-radius: 50%; "alt="User avatar" width="150px" height="auto">
<h1 class="text-center mt-4"> Welcome ${user.username}#${user.discriminator} </h1>
`;
