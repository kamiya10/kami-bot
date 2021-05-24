let socket
let color = '#000'
let strokeWidth = 4
let strokeFinal;
let cv;
let cursorEnabled = true;
let pressureEnabled = false;

Pressure.set('#canvas_container', {
    change: function (force, event) {
        if (pressureEnabled) {
            strokeFinal = strokeWidth * force;
            document.getElementById("pressure").innerHTML = `${force}<br>${Math.round((strokeFinal + Number.EPSILON) * 1000) / 1000}px`
            console.log(strokeFinal);
        } else {
            strokeFinal = strokeWidth;
            document.getElementById("pressure").innerHTML = `1<br>${strokeFinal}px`
        }
    }
});

$(document).ready(function () {

    var cmouseX = 0, cmouseY = 0;
    var xp = 0, yp = 0;

    $(document).mousemove(function (e) {
        if ($("#canvas_container:hover").length != 0) {
            cmouseX = e.pageX - (strokeWidth / 2);
            cmouseY = e.pageY - (strokeWidth / 2);
        }
    });

    setInterval(function () {
        xp += ((cmouseX - xp) / 6);
        yp += ((cmouseY - yp) / 6);
        $("#circle").css({ left: xp + 'px', top: yp + 'px', width: strokeWidth + 'px', height: strokeWidth + 'px', display: cursorEnabled ? "initial" : "none" });
    }, 1);


    $('#cursorEnabled').change(function () {
        if ($(this).is(":checked")) {
            cursorEnabled = true;
        } else {
            cursorEnabled = false;
        }
    });

    $('#pressureEnabled').change(function () {
        if ($(this).is(":checked")) {
            pressureEnabled = true;
        } else {
            pressureEnabled = false;
        }
    });
});

function updateValue(value) {
    let el = document.getElementById("stroketext");
    el.innerText = "筆刷大小: " + value + "px";
    strokeWidth = parseInt(value);
}

function savePNG() {
    saveCanvas(cv, 'masterpiece', "png")
}
function saveJPG() {
    saveCanvas(cv, 'masterpiece', "jpeg")
}

const pickr = Pickr.create({
    el: '.color-picker',
    theme: 'classic',
    inline: true,
    default: '#000',

    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 0.95)',
        'rgba(156, 39, 176, 0.9)',
        'rgba(103, 58, 183, 0.85)',
        'rgba(63, 81, 181, 0.8)',
        'rgba(33, 150, 243, 0.75)',
        'rgba(3, 169, 244, 0.7)',
        'rgba(0, 188, 212, 0.7)',
        'rgba(0, 150, 136, 0.75)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(139, 195, 74, 0.85)',
        'rgba(205, 220, 57, 0.9)',
        'rgba(255, 235, 59, 0.95)',
        'rgba(255, 193, 7, 1)'
    ],

    components: {

        // Main components
        preview: true,
        opacity: false,
        hue: true,

        // Input / output Options
        interaction: {
            hex: true,
            rgba: true,
            hsla: true,
            cmyk: true,
            input: true,
            cancel: true,
            save: true
        }
    },

    i18n: {
        // Strings visible in the UI
        'ui:dialog': '調色盤',
        'btn:toggle': '切換調色盤視窗',
        'btn:swatch': '預設色板',
        'btn:last-color': '使用上一個顏色',
        'btn:save': '儲存',
        'btn:cancel': '取消',
        'btn:clear': '清除'
    }
});

pickr.on('init', instance => {
    console.log(instance)

    // Grab actual input-element
    const { result } = instance.getRoot().interaction;

    // Listen to any key-events
    result.addEventListener('keydown', e => {

        // Detect whever the user pressed "Enter" on their keyboard
        if (e.key === 'Enter') {
            instance.applyColor(); // Save the currently selected color
            instance.hide(); // Hide modal
        }
    }, { capture: true });
});

pickr.on('save', (_color, instance) => {
    color = "#" + _color.toHEXA().join("");
})
function setup() {
    // Creating canvas
    cv = createCanvas(1000, 600);
    cv.parent('canvas_container');
    cv.background("#fff");

    // Start the socket connection
    socket = io.connect('https://www.kamiya.tk/');

    // Callback function
    socket.on('connectionUpdate', () => {
        console.log("connectionUpdate")
        socket.emit('updateCanvas', { data: cv.canvas.toDataURL() })
    })

    socket.on('mouse', data => {
		stroke(data.color)
		strokeWeight(data.strokeWidth)
		line(data.x, data.y, data.px, data.py)
	});
}

function mouseDragged() {
    cmouseX = mouseX;
    cmouseY = mouseY;
    // Draw
    stroke(color)
    strokeWeight(strokeFinal)
    line(mouseX, mouseY, pmouseX, pmouseY)

    // Send the mouse coordinates
    sendmouse(mouseX, mouseY, pmouseX, pmouseY)
}

// Sending data to the socket
function sendmouse(x, y, pX, pY) {
    const data = {
        x: x,
        y: y,
        px: pX,
        py: pY,
        color: color,
        strokeWidth: strokeFinal,
    }

    socket.emit('mouse', data)
}

function clearCanvas() {
    const data = {
        owo: "owo"
    }
    background('#fff');
    socket.emit('updateCanvas', { data: cv.canvas.toDataURL() })
}