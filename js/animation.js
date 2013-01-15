animation = {

    animate: function (opts) {

        var start = new Date

        var id = setInterval(function () {
            var timePassed = new Date - start
            var progress = timePassed / opts.duration

            if (progress > 1) progress = 1

            var delta = opts.delta(progress)
            opts.step(delta)

            if (progress == 1) {
                clearInterval(id)
            }
        }, opts.delay)

    },


    elastic: function (progress) {
        return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * 1.5 / 3 * progress);
    },

    linear: function (progress) {
        return progress
    },

    quad: function (progress) {
        return Math.pow(progress, 2)
    },

    quint: function (progress) {
        return Math.pow(progress, 5);
    },

    circ: function (progress) {
        return 1 - Math.sin(Math.acos(progress));
    },

    back: function (progress) {
        return Math.pow(progress, 2) * ((1.5 + 1) * progress - 1.5);
    },


    bounce: function (progress) {
        for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
            if (progress >= (7 - 4 * a) / 11) {
                return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
            }
        }
    },

    makeEaseInOut: function (delta) {
        return function (progress) {
            if (progress < .5)
                return delta(2 * progress) / 2
            else
                return (2 - delta(2 * (1 - progress))) / 2
        }
    },


    makeEaseOut: function (delta) {
        return function (progress) {
            return 1 - delta(1 - progress)
        }
    }


};