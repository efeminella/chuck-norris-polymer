
'use strict';

/**
 * The ChuckNorrisFacts class provides the state and behaviors for
 * implementing the chuck norris facts element.
 *
 * @class ChuckNorrisFacts
 */
class ChuckNorrisFacts {
    /**
     * The beforeRegister method is invoked by Polymer before the element is created.
     *
     * @method beforeRegister
     */
    beforeRegister() {
        const defaults = ChuckNorrisFacts.defaults;
        this.is = 'chuck-norris-facts';

        this.properties = {
            fact: {
                type: String,
                notify: true,
                reflectToAttribute: true
            },
            factId: {
                type: String,
                reflectToAttribute: true
            },
            firstname: {
                type: String,
                value: defaults.firstname,
                reflectToAttribute: true
            },
            lastname: {
                type: String,
                value: defaults.lastname,
                reflectToAttribute: true
            },
            categories: {
                type: Object,
                notify: true,
                value: function(){
                    return defaults.categories;
                }
            }
        };
    }

    /**
     * Invoked when this element's local DOM has been created and initialization
     * has been completed.
     *
     * https://www.polymer-project.org/1.0/docs/devguide/registering-elements.html#ready-method
     *
     * @method ready
     */
    ready() {
        this._getFact();
    }

    /**
     * Invokes the service API to retrieve the latest fact.
     *
     * @method _getFact
     */
    _getFact() {
        const url = 'http://api.icndb.com/jokes/random';
        const params = `?firstName=${this.firstname}&lastName=${this.lastname}&escape=javascript&limitTo=[${this._getCategories()}]`;
        if (!this.isLoading) {
            this.isLoading = true;
            this.$.service.url = `${url}${params}`;
            this.$.service.generateRequest();
        }
    }

    /**
     * Invoked when the response is received from the server, at which point
     * the current quote and quite number is updated and displayed.
     *
     * @method _setFact
     * @param {Object} request The request object containing the service response.
     */
    _setFact(request) {
        let response = this.$.service.lastResponse;
        this.isLoading = false;
        if (response) {
            response = response.value;
            this.factId  = `Fact #${response.id}`;
            this.fact    = response.joke;
        }
    }

    /**
     * Returns the current selected categories to be displayed.
     *
     * @method _getCategories
     * @return {String} the selected categories as a string array.
     */
    _getCategories() {
        const filtered = [];
        for (var cat in this.categories) {
            if (this.categories[cat]) {
                filtered.push(cat);
            }
        }
        return filtered.toString();
    }

    /**
     * Invoked when the user taps the update button in the settings panel.
     *
     * @method _personalize
     */
    _personalize() {
        let first = this.$.first.value;
        let last  = this.$.last.value;
        if (first && last) {
            this.firstname = first;
            this.lastname  = last;
        }
        this._getFact();
        this.$.drawer.togglePanel();
    }

    /**
     * Displays the prompt message which requires the user to confirm
     * resetting the personalization settings.
     *
     * @method prompt
     */
    prompt() {
        this.$.notification.opened = true;
        this.$.notification.fit();
    }

    /**
     * Invoked when the user cancels the prompt message.
     *
     * @method cancel
     */
    cancel() {
        this.$.notification.opened = false;
        this.$.drawer.togglePanel();
    }

    /**
     * Invoked when the user chooses to reset their currently _personalized
     * settings.
     *
     * @method reset
     */
    reset() {
        const defaults = ChuckNorrisFacts.defaults;
        this.$.notification.opened = false;
        this.$.first.value = '';
        this.$.last.value  = '';
        this.categories = defaults.categories;
        this.firstname  = defaults.firstname;
        this.lastname   = defaults.lastname;
        this.$.drawer.togglePanel();
        this._getFact();
    }

    /**
     * Provides the default values to be used by all elements.
     *
     * @method defaults;
     * @return {Object} an object containing the default firstname,
     *         lastname, and categories.
     */
    static get defaults() {
        return {
            firstname: 'Chuck',
            lastname:  'Norris',
            categories: {
                explicit: false,
                nerdy: true
            }
        };
    }
}
