/*
R
modified from pxt-servo/servodriver.ts
load dependency
"robotbit": "file:../pxt-robotbit"
*/


//% color="#2c3e50" weight=10
namespace robotbit {
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09
    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD
	
	export enum Servos {
		S1 = 0x01,
		S2 = 0x02,
		S3 = 0x03,
		S4 = 0x04,
		S5 = 0x05,
		S6 = 0x06,
		S7 = 0x07,
		S8 = 0x08
	}
	
	export enum Motors {
		M1A = 0x1,
		M1B = 0x2,
		M2A = 0x3,
		M2B = 0x4
	}

    let initialized = false

    function i2cwrite(reg: number, value: number) {
		let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf)
    }

	function i2cread(reg: number){
		pins.i2cWriteNumber(PCA9685_ADDRESS, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(PCA9685_ADDRESS, NumberFormat.UInt8BE);
        return val;
	}

    function initPCA9685(): void {
		i2cwrite(MODE1, 0x00)
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= 50;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(MODE1);        
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(MODE1, newmode); // go to sleep
        i2cwrite(PRESCALE, prescale); // set the prescaler
        i2cwrite(MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(MODE1, oldmode | 0xa1);

        initialized = true
    }
	
	function setPwm(channel: number, on: number, off: number): void {
		if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on>>8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off>>8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
	}	

	
	//% blockId=robotbit_servo block="Servo|index %index|degree %degree"
	export function Servo(index: Servos, degree: number = 90): void {
		if(!initialized){
			initPCA9685()
		}
		// 50hz: 20,000 us
        let v_us = (degree*1000/180+1000)
        let value = v_us*4096/20000
        setPwm(index+7, 0, value)
    }
	
	//% blockId=robotbit_motor block="Motor|index %index|speed %speed"
	export function Motor(index: Motors, speed: number = 100): void {
		if(!initialized){
			initPCA9685()
		}
		if(index>4 || index<=0)
			return
		let pp = (index-1)*2
		let pn = (index-1)*2+1
		if(speed>=0){
			setPwm(pp, 0, speed)
			setPwm(pn, 0, 0)
		}else{
			setPwm(pp, 0, 0)
			setPwm(pn, 0, -speed)
		}
		
	}
	
}
