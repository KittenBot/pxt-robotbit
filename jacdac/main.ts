//% deprecated
namespace robotbit {

}

namespace modules {
    /**
     * Motor 1A
     */
    //% fixedInstance whenUsed block="robobit motor 1A"
    export const robobitMotor1A = new MotorClient("robobit motor 1A?device=self")
    /**
     * Motor 1B
     */
    //% fixedInstance whenUsed block="robobit motor 1B"
    export const robobitMotor1B = new MotorClient("robobit motor 1B?device=self")
    /**
     * Motor 2A
     */
    //% fixedInstance whenUsed block="robobit motor 2A"
    export const robobitMotor2A = new MotorClient("robobit motor 2A?device=self")
    /**
     * Motor 2B
     */
    //% fixedInstance whenUsed block="robobit motor 2B"
    export const robobitMotor2B = new MotorClient("robobit motor 2B?device=self")
}

namespace servers {
    jacdac.productIdentifier = 0x3dffd752
    class MotorServer extends jacdac.Server {
        motor: robotbit.Motors
        speed: number
        enabled: boolean

        constructor(motor: robotbit.Motors) {
            super(jacdac.SRV_MOTOR)
            this.motor = motor
            this.enabled = false

            robotbit.MotorStop(this.motor)
        }

        handlePacket(pkt: jacdac.JDPacket) {
            this.handleRegValue(pkt, jacdac.MotorReg.Reversible, jacdac.MotorRegPack.Reversible, true)
            this.speed = this.handleRegValue(pkt, jacdac.MotorReg.Duty, jacdac.MotorRegPack.Duty, this.speed)
            this.enabled = this.handleRegBool(pkt, jacdac.MotorReg.Enabled, this.enabled)

            this.sync()
        }

        sync() {
            if (!this.enabled || this.speed == 0)
                robotbit.MotorStop(this.motor)
            else {
                robotbit.MotorRun(this.motor, this.speed * 0xff)
            }
        }
    }
    function start() {
        jacdac.startSelfServers(() => [
            new MotorServer(robotbit.Motors.M1A),
            new MotorServer(robotbit.Motors.M1B),
            new MotorServer(robotbit.Motors.M2A),
            new MotorServer(robotbit.Motors.M2B),
        ])
    }
    start()
}