let speed = 0
let dv = 5
forever(() => {
    modules.robobitMotor1A.setEnabled(true)
    modules.robobitMotor1B.setEnabled(true)
    modules.robobitMotor2A.setEnabled(true)
    modules.robobitMotor2B.setEnabled(true)

    modules.robobitMotor1A.setDuty(speed)
    modules.robobitMotor1B.setDuty(1 - speed)
    modules.robobitMotor2A.setDuty(speed / 2)
    modules.robobitMotor2B.setDuty((1 - speed) / 2)

    speed += dv
    if (speed > 100) {
        dv = -5
    } else if (speed < -100) {
        dv = 5
    }
    pause(250)
})