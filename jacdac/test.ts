let speed = 0
let dv = 5
forever(() => {
    led.toggle(0, 0)
    
    modules.robotbitMotor1A.run(speed)
    modules.robotbitMotor1B.run(100 - speed)
    modules.robotbitMotor2A.run(speed / 2)
    modules.robotbitMotor2B.run((100 - speed) / 2)

    modules.robotbitServoS1.setAngle(speed)
    modules.robotbitServoS2.setAngle(speed)
    modules.robotbitServoS3.setAngle(speed)
    modules.robotbitServoS4.setAngle(speed)
    modules.robotbitServoS5.setAngle(speed)
    modules.robotbitServoS6.setAngle(speed)
    modules.robotbitServoS7.setAngle(speed)
    modules.robotbitServoS8.setAngle(speed)

    speed += dv
    if (speed > 100) {
        dv = -5
    } else if (speed < -100) {
        dv = 5
    }
    pause(250)
})