# This is the basic directories, files and workflow to translate KanaDojo using `next-intl` internationalization tool.

## Packages.

We use `next-intl` internationalization tool in this project to manage translations into several languages.

## Directories and files.

Translated text content is staticly stored as key-value pairs properties of a single object using only one file per language under **/core/i18n/locales/ directory** and it must follow a two letters language code just like `es for Spanish` or `en for English` and its extension must be .json

You can go to the core/i18n/locales directory and see already partial translations sitting there.

`Translation request helper` is the function defined in **/core/i18n/request.ts** and it helps retrieving the translated text on demand. Every time we need to render a translated text through `next-intl implementation` this is the function solving the translation. Its conventions are mandatory since they are keys for the `next-intl` workflow.

This **/core/i18n/** directory will host more essential functions for the `translation management system` as we implement workflows and strategies to make translation and localization smooth for our users.

## Implementation.

The described `initial translation management system` enables the developer to change:

`<p>Welcome to KanaDojo!</p>`

to

`<p>{t('greeting')}</p>`

being

`t = useTranslations('query')` **for server components**

and

`t = getTranslations('query')` **for client components.**

Above functions are provided by `next-inl` package and **can only be used inside of react functions.**

## Example.

if **/core/i18n/locales/es.json** holds:

`{ "MenuInfo": { "greeting": "¡Bienvenido a KanaDojo!"...} }`

the usage of `const t = useTranslations('MenuInfo')` will store the queried property and all of its nested properties can be thus accessed in `t`.

The developer can now implement

`<p>{t('greeting')}</p>`

and expect

`<p>¡Bienvenido a KanaDojo!</p>`

to be actually rendered if the locale of Spanish 'es' is provided by the system.
