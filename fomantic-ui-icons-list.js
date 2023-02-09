import css from 'css';
import fetch from 'node-fetch';
import * as fs from "fs";

/* -----------------------------------------------------------------------
This script gets the latest icons by category from Fomantic UI source code
----------------------------------------------------------------------- */
fetch('https://raw.githubusercontent.com/fomantic/Fomantic-UI/develop/dist/components/icon.css')
    .then(async function (data) {
        const text = await data.text();
        const rules = css.parse(text).stylesheet.rules;

        const output = {
            "solid": {
                "prefix": "",
                "icons": [],
            },
            "outline":  {
                "prefix": "",
                "icons": [],
            },
            "brands": {
                "prefix": "",
                "icons": [],
            },
        }
        rules.forEach((rule) => {
            if (rule.type === "rule") {
                const icon = rule.selectors[0]
                    .replace('i.icon.', '')
                    .replace('::before', '')
                    .replaceAll('.', ' ')
                    + ' icon';

                // brand icons have 2 type "declaration", one with property "content" and one with "font-family" (value "brand-icons")
                if (rule.declarations.length === 2) {
                    if (rule.declarations[0].property === 'content' && rule.declarations[1].property === 'font-family' && rule.declarations[1].value === '"brand-icons"') {
                        output['brands']['icons'].push(
                            icon
                        );
                    }
                }

                // solid + outline icons have 1 type "declaration" with property "content" and value "\\f<code>"
                if (rule.declarations.length === 1) {
                    if (rule.declarations[0].property === 'content' && rule.declarations[0].value.startsWith('"\\f')) {
                        if (icon.includes('outline')) {
                            output['outline']['icons'].push(
                                icon
                            );
                        } else {
                            output['solid']['icons'].push(
                                icon
                            );
                        }
                    }
                }
            }
        })

        fs.writeFileSync('./fomantic-ui.json', JSON.stringify(output, null, 2));
    }).catch(function (error) {
        console.log(error);
    });
