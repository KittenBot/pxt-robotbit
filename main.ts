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
	
	const STP_CHA_L = 2047
	const STP_CHA_H = 4095
	
	const STP_CHB_L = 1
	const STP_CHB_H = 2047
	
	const STP_CHC_L = 1023
	const STP_CHC_H = 3071
	
	const STP_CHD_L = 3071
	const STP_CHD_H = 1023
	
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
	
	export enum Steppers {
		M1 = 0x1,
		M2 = 0x2
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
        setFreq(50);
        initialized = true
    }
	
	function setFreq(freq: number): void {
		// Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(MODE1);        
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(MODE1, newmode); // go to sleep
        i2cwrite(PRESCALE, prescale); // set the prescaler
        i2cwrite(MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(MODE1, oldmode | 0xa1);
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
	export function Servo(index: Servos, degree: number): void {
		if(!initialized){
			initPCA9685()
		}
		// 50hz: 20,000 us
        let v_us = (degree*1600/180+700) // 0.7 ~ 2.3
        let value = v_us*4096/20000
        setPwm(index+7, 0, value)
    }
	
	//% blockId=robotbit_motor block="Motor|index %index|speed %speed"
	export function Motor(index: Motors, speed: number): void {
		if(!initialized){
			initPCA9685()
		}
		speed = speed*16; // map 255 to 4096
		if(speed>=4096){
			speed = 4095
		}
		if(speed<=-4096){
			speed = -4095
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
	
	//% blockId=robotbit_stepper block="Stepper28BYJ|index %index|degree %degree"
	export function Stepper28BYJ(index: Steppers, degree: number): void {
		setFreq(100);
		if(index == Steppers.M1){
			setPwm(0,STP_CHA_L,STP_CHA_H);
			setPwm(2,STP_CHB_L,STP_CHB_H);
			setPwm(1,STP_CHC_L,STP_CHC_H);
			setPwm(3,STP_CHD_L,STP_CHD_H);	
		}else{
			setPwm(4,STP_CHA_L,STP_CHA_H);
			setPwm(6,STP_CHB_L,STP_CHB_H);
			setPwm(5,STP_CHC_L,STP_CHC_H);
			setPwm(7,STP_CHD_L,STP_CHD_H);	
		}
		
		basic.pause(5120*degree/360);
		Stop()
		setFreq(50);
	}
	
	
	//% blockId=robotbit_stop block="Stop|"
	export function Stop(): void {
		for(let idx=0;idx<8;idx++){
			setPwm(idx, 0, 0);
		}
	}
	

}
