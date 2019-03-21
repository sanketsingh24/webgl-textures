/**
 * @module ControlsGUI
 */
define(['text!controls__gui_info.txt'], function (instructions) {

    var triggerAnimation;

    /**
     * Creates the GUI.
     * @method createGUI
     * @param  {object} planetShortcuts    Array of planet names and the keyboard shortcut to use to snap to them.  
     * @param  {Function} triggerAnimationParameter Provides a hook for updating animation after changing input values (@TODO - this is a code smell. Should decouple the animation from the GUI inputs.)
     */
    function createGUI(planetShortcuts, triggerAnimationParameter) {
        triggerAnimation = triggerAnimationParameter;
        
        var canvasContainer       = document.getElementById('canvas_solar_system__container'),
            instructionsContainer = document.createElement('DIV'),
            guiContainer          = document.createElement('DIV');
        
        canvasContainer.insertBefore(instructionsContainer, canvasContainer.firstChild);
        canvasContainer.appendChild(guiContainer);
        guiContainer.id = 'webgl_solarsystem_gui';
        instructionsContainer.id = 'webgl_solarsystem_instructions';

        createInstructions(instructionsContainer, planetShortcuts);
        createSliders(guiContainer);
    }

    /**
     * @method createInstructions
     * @param  {DOMElement} instructionsContainer  The DIV we need to populate with instructions.
     * @param  {object} planetShortcuts    Array of planet names and the keyboard shortcut to use to snap to them. 
     */
    function createInstructions(instructionsContainer, planetShortcuts) {
        instructionsContainer.innerHTML = instructions;
        for (var shortcut in planetShortcuts) {
            instructionsContainer.innerHTML += '<strong>' + shortcut + '</strong>: ' + planetShortcuts[shortcut].name + ', ';
        }
    }

    /**
     * Creates a DIV and appends to the given DOMElement container.
     * 
     * @method createDiv
     * @param  {DOMElement} guiContainer The container to append the DIV to.
     * @param  {String}   classes        The classname to give the DIV.
     * @param  {Function} callback       Optional callback function.
     * @return {DOMElement}              The newly created DIV.
     */
    function createDiv(guiContainer, classes, callback) {
        var newDiv = document.createElement('DIV');
        newDiv.className = classes;
        guiContainer.appendChild(newDiv);

        if (callback) {
            callback();
        }

        return newDiv;
    }

    /**
     * Creates the sliders in the GUI.
     * @method createSliders
     * @param  {DOMElement} guiContainer Document element to insert the sliders in.
     */
    function createSliders(guiContainer) {
        var speedContainer               = createDiv(
                guiContainer,
                'webgl_solarsystem_gui__fieldset_container webgl_solarsystem_gui__fieldset_container--cols_2'
            ),
            shininessContainer           = createDiv(
                guiContainer,
                'webgl_solarsystem_gui__fieldset_container webgl_solarsystem_gui__fieldset_container--cols_2',
                function () {
                    var separator = document.createElement('HR');
                    separator.setAttribute('style', 'clear: both;');
                    guiContainer.appendChild(separator);
                }
            ),
            lightingContainerAmbient     = createDiv(
                guiContainer,
                'webgl_solarsystem_gui__fieldset_container webgl_solarsystem_gui__fieldset_container--cols_3'
            ),
            lightingContainerSunSpecular = createDiv(
                guiContainer,
                'webgl_solarsystem_gui__fieldset_container webgl_solarsystem_gui__fieldset_container--cols_3'
            ),
            lightingContainerSunDiffuse  = createDiv(
                guiContainer,
                'webgl_solarsystem_gui__fieldset_container webgl_solarsystem_gui__fieldset_container--cols_3'
            ),
            speedInfo;

        var globals = {
            ambient:   0.4,
            specular:  0.7,
            diffuse:   0.7,
            shininess: 5
        };

        createSlider({
            label:      'Time',
            id:         'millisecondsPerDay',
            minLabel:   'Fast',
            maxLabel:   'Slow',
            min:        10,
            max:        5000,
            step:       10,
            defaultVal: 1000,
            container:  speedContainer,
            onChangeCallback: updateMillisecondsPerDay
        });

        speedInfo = document.createElement('DIV');
        speedInfo.id = 'millisecondsPerDayInfo';
        speedContainer.appendChild(speedInfo);
        updateMillisecondsPerDay();

        createSlider({
            label:      'Planet shininess',
            id:         'planetShininess',
            min:        0,
            max:        255,
            step:       1,
            defaultVal: globals.shininess,
            container:  shininessContainer
        });

        createSlider({
            label:      'Ambient Light - Global',
            id:         'ambientGlobal',
            min:        0,
            max:        1,
            defaultVal: globals.ambient,
            step:       0.1,
            container:  lightingContainerAmbient,
            onChangeCallback: function () {
                updateValueOfSliders('ambientGlobal', ['ambientR', 'ambientG', 'ambientB']);
            }
        });

        createSlider({
            label:      'Ambient Light - Red',
            id:         'ambientR',
            min:        0,
            max:        1,
            defaultVal: globals.ambient,
            step:       0.1,
            container:  lightingContainerAmbient
        });

        createSlider({
            label:      'Ambient Light - Green',
            id:         'ambientG',
            min:        0,
            max:        1,
            defaultVal: globals.ambient,
            step:       0.1,
            container:  lightingContainerAmbient
        });

        createSlider({
            label:      'Ambient Light - Blue',
            id:         'ambientB',
            min:        0,
            max:        1,
            defaultVal: globals.ambient,
            step:       0.1,
            container:  lightingContainerAmbient
        });

        createSlider({
            label:      'Specular term - Global',
            id:         'pointGlobalSpecular',
            min:        0,
            max:        1,
            defaultVal: globals.specular,
            step:       0.1,
            container:  lightingContainerSunSpecular,
            onChangeCallback: function () {
                updateValueOfSliders('pointGlobalSpecular', ['pointRSpecular', 'pointGSpecular', 'pointBSpecular']);
            }
        });

        createSlider({
            label:      'Specular term - Red',
            id:         'pointRSpecular',
            min:        0,
            max:        1,
            defaultVal: globals.specular,
            step:       0.1,
            container:  lightingContainerSunSpecular
        });

        createSlider({
            label:      'Specular term - Green',
            id:         'pointGSpecular',
            min:        0,
            max:        1,
            defaultVal: globals.specular,
            step:       0.1,
            container:  lightingContainerSunSpecular
        });

        createSlider({
            label:      'Specular term - Blue',
            id:         'pointBSpecular',
            min:        0,
            max:        1,
            defaultVal: globals.specular,
            step:       0.1,
            container:  lightingContainerSunSpecular
        });

        createSlider({
            label:      'Diffuse term - Global',
            id:         'pointGlobalDiffuse',
            min:        0,
            max:        1,
            defaultVal: globals.diffuse,
            step:       0.1,
            container:  lightingContainerSunDiffuse,
            onChangeCallback: function () {
                updateValueOfSliders('pointGlobalDiffuse', ['pointRDiffuse', 'pointGDiffuse', 'pointBDiffuse']);
            }
        });

        createSlider({
            label:      'Diffuse term - Red',
            id:         'pointRDiffuse',
            min:        0,
            max:        1,
            defaultVal: globals.diffuse,
            step:       0.1,
            container:  lightingContainerSunDiffuse
        });

        createSlider({
            label:      'Diffuse term - Green',
            id:         'pointGDiffuse',
            min:        0,
            max:        1,
            defaultVal: globals.diffuse,
            step:       0.1,
            container:  lightingContainerSunDiffuse
        });

        createSlider({
            label:      'Diffuse term - Blue',
            id:         'pointBDiffuse',
            min:        0,
            max:        1,
            defaultVal: globals.diffuse,
            step:       0.1,
            container:  lightingContainerSunDiffuse
        });
    }

    /**
     * Creates a slider.
     * @method createSlider
     * @param  {Object} config Configuration object.
     */
    function createSlider(config) {
        var fieldset = document.createElement('FIELDSET'),
            slider   = document.createElement('INPUT'),
            label    = document.createElement('LABEL');
        
        label.innerHTML = config.label;

        slider.type  = 'range';
        slider.id    = config.id;
        slider.step  = config.step || 1;
        slider.min   = config.min;
        slider.max   = config.max;
        slider.value = config.defaultVal;

        if (config.onChangeCallback) {
            slider.oninput = function () {
                config.onChangeCallback();
                triggerAnimation();
            };
        }
        else {
            slider.oninput = triggerAnimation;
        }

        config.container.appendChild(fieldset);
        fieldset.appendChild(label);
        fieldset.appendChild(document.createTextNode(config.minLabel || slider.min));
        fieldset.appendChild(slider);
        fieldset.appendChild(document.createTextNode(config.maxLabel || slider.max));
    }

    /**
     * Updates the value displayed to users when they change the number of milliseconds per day.
     * @method updateMillisecondsPerDay
     */
    function updateMillisecondsPerDay() {
        var inputValue = document.getElementById('millisecondsPerDay').value,
            info  = document.getElementById('millisecondsPerDayInfo'),
            millisecondsPerDay = parseInt(inputValue, 10),
            secondsPerDay = millisecondsPerDay / 1000,
            html = '1 Earth day = ';

        if (secondsPerDay < 1) {
            html += millisecondsPerDay + ' milliseconds';
        }
        else {
            html += (secondsPerDay + ' ') + (secondsPerDay > 1 ? 'seconds' : 'second');
        }

        info.innerHTML = html;
    }

    /**
     * Updates the value of all the given sliders. This way we can have one 'master' slider that controls all the others.
     * @method updateValueOfSliders
     * @param  {String} globalSlider    ID of the master slider.
     * @param  {array} slidersToUpdate Array of IDs of the sliders that should be updated when the master is updated.
     */
    function updateValueOfSliders(globalSlider, slidersToUpdate) {
        var value = document.getElementById(globalSlider).value,
            currentSlider;

        for (var i = 0; i < slidersToUpdate.length; i++) {
            currentSlider = document.getElementById(slidersToUpdate[i]);
            currentSlider.value = value;
        }
    }

    /**
     * @class ControlsGUI
     */
    return {
        /**
         * Initialises the GUI.
         * @method init
         * @constructor
         */
        init: createGUI
    };
});