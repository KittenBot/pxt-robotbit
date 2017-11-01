/*
R
modified from pxt-servo/servodriver.ts
load dependency
"robotbit": "file:../pxt-robotbit"
*/


//% color="#31C7D5" weight=10 icon="\uf1d0"
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
	
	export enum Turns {
		//% blockId="T1B4" block="1/4"
	    T1B4 = 0.25,
		//% blockId="T1B2" block="1/2"
	    T1B2 = 0.5,
		//% blockId="T1B0" block="1"
	    T1B0 = 1,
		//% blockId="T2B0" block="2"
	    T2B0 = 2,
		//% blockId="T3B0" block="3"
	    T3B0 = 3,
		//% blockId="T4B0" block="4"
	    T4B0 = 4,
		//% blockId="T5B0" block="5"
	    T5B0 = 5
	}

    let initialized = false
	let neoStrip: neopixel.Strip;

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

	/**
     * Init RGB pixels mounted on robotbit
     */
    //% blockId="robotbit_rgb" block="RGB"
    //% weight=5
    export function rgb(): neopixel.Strip {
        if (!neoStrip) {
            neoStrip = neopixel.create(DigitalPin.P16, 4, NeoPixelMode.RGB)
        }

        return neoStrip;
    }
	
	//% blockId=robotbit_servo block="Servo|%index|degree %degree"
	//% weight=100
	//% blockGap=50
	//% degree.min=0 degree.max=180
	//% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
	export function Servo(index: Servos, degree: number): void {
		if(!initialized){
			initPCA9685()
		}
		// 50hz: 20,000 us
        let v_us = (degree*1800/180+600) // 0.6 ~ 2.4
        let value = v_us*4096/20000
        setPwm(index+7, 0, value)
    }
	
	//% blockId=robotbit_stepper_degree block="Stepper 28BYJ-48|%index|degree %degree"
	//% weight=90
	export function StepperDegree(index: Steppers, degree: number): void {
		if(!initialized){
			initPCA9685()
		}
		setFreq(100);
		if(index == Steppers.M1){
			if(degree>0){
				setPwm(0,STP_CHA_L,STP_CHA_H);
				setPwm(2,STP_CHB_L,STP_CHB_H);
				setPwm(1,STP_CHC_L,STP_CHC_H);
				setPwm(3,STP_CHD_L,STP_CHD_H);		
			}else{
				setPwm(3,STP_CHA_L,STP_CHA_H);
				setPwm(1,STP_CHB_L,STP_CHB_H);
				setPwm(2,STP_CHC_L,STP_CHC_H);
				setPwm(0,STP_CHD_L,STP_CHD_H);
				degree = -degree;
			}
		}else{
			if(degree>0){
				setPwm(4,STP_CHA_L,STP_CHA_H);
				setPwm(6,STP_CHB_L,STP_CHB_H);
				setPwm(5,STP_CHC_L,STP_CHC_H);
				setPwm(7,STP_CHD_L,STP_CHD_H);		
			}else{
				setPwm(7,STP_CHA_L,STP_CHA_H);
				setPwm(5,STP_CHB_L,STP_CHB_H);
				setPwm(6,STP_CHC_L,STP_CHC_H);
				setPwm(4,STP_CHD_L,STP_CHD_H);
				degree = -degree;
			}
		}
		
		basic.pause(5120*degree/360);
		MotorStopAll()
		setFreq(50);
	}
	
	//% blockId=robotbit_stepper_turn block="Stepper 28BYJ-48|%index|turn %turn"
	//% weight=90
	//% blockGap=50
	//% blockGap=50
	export function StepperTurn(index: Steppers, turn: Turns): void {
		let degree = turn*360;
		StepperDegree(index, degree);
	}
	
	
	//% blockId=robotbit_motor_run block="Motor|%index|speed %speed"
	//% weight=85
	//% speed.min=-255 speed.max=255
	//% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
	export function MotorRun(index: Motors, speed: number): void {
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
	
	
	/**
	 * Execute two motors at the same time
	 * @param motor1 First Motor; eg: M1A, M1B
	 * @param speed1 [-255-255] speed of motor; eg: 150, -150
	 * @param motor2 Second Motor; eg: M2A, M2B
	 * @param speed2 [-255-255] speed of motor; eg: 150, -150
	*/
	//% blockId=robotbit_motor_dual block="Motor|%motor1|speed %speed1|%motor2|speed %speed2"
	//% weight=84
	//% speed1.min=-255 speed1.max=255
	//% speed2.min=-255 speed2.max=255
	//% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
	export function MotorRunDual(motor1: Motors, speed1: number, motor2: Motors, speed2: number): void {
		MotorRun(motor1, speed1);
		MotorRun(motor2, speed2);
	}
	
	//% blockId=robotbit_motor_rundelay block="Motor|%index|speed %speed|delay %delay|s"
	//% weight=81
	//% speed.min=-255 speed.max=255
	//% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
	export function MotorRunDelay(index: Motors, speed: number, delay: number): void {
		MotorRun(index, speed);
		basic.pause(delay*1000);
		MotorRun(index, 0);		
	}
	
	
	
	//% blockId=robotbit_stop block="Motor Stop|%index|"
	//% weight=80
	export function MotorStop(index: Motors): void {
		MotorRun(index, 0);
	}
	
	//% blockId=robotbit_stop_all block="Motor Stop All"
	//% weight=79
	export function MotorStopAll(): void {
		for(let idx=0;idx<8;idx++){
			setPwm(idx, 0, 0);
		}	
	}
	
	//% blockId=robotbit_ultrasonic block="Ultrasonic|pin %pin"
	//% weight=10
    export function Ultrasonic(pin: DigitalPin): number {
		
        // send pulse
        pins.setPull(pin, PinPullMode.PullNone);
        pins.digitalWritePin(pin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(pin, 1);
        control.waitMicros(10);
        pins.digitalWritePin(pin, 0);

        // read pulse
        let d = pins.pulseIn(pin, PulseValue.High, 11600);
        return d / 58;
    }


}
