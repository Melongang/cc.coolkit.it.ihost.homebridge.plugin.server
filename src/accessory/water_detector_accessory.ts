import { base_accessory } from './base_accessory';
import { HomebridgePlatform } from '../HomebridgePlatform';
import { PlatformAccessory, Categories, CharacteristicValue, Service } from 'homebridge';
import { IDevice, IDeviceState } from '../ts/interface/IDevice';
import { ECapability } from '../ts/enum/ECapability';
import deviceUtils from '../utils/deviceUtils';

export class water_detector_accessory extends base_accessory {

	service: Service | undefined;
	batteryService: Service | undefined;

	constructor(platform: HomebridgePlatform, accessory: PlatformAccessory | undefined, device: IDevice) {
		super(platform, accessory, Categories.SENSOR, device);
	}

	mountService(): void {
		this.service = this.accessory?.getService(this.platform.Service.LeakSensor) || this.accessory?.addService(this.platform.Service.LeakSensor);
		this.service?.getCharacteristic(this.platform.Characteristic.LeakDetected)
			.onGet(() => {
				return deviceUtils.getDeviceStateByCap(ECapability.DETECT, this.device)
			})

		if (deviceUtils.renderServiceByCapability(this.device, ECapability.BATTERY)) {
			this.batteryService = this.accessory?.getService(this.platform.Service.Battery) || this.accessory?.addService(this.platform.Service.Battery);
			this.batteryService?.getCharacteristic(this.platform.Characteristic.StatusLowBattery)
				.onGet(() => (+deviceUtils.getDeviceStateByCap(ECapability.BATTERY, this.device) < 20 ? 1 : 0));

			this.batteryService?.getCharacteristic(this.platform.Characteristic.BatteryLevel)
				.onGet(() => {
					return deviceUtils.getDeviceStateByCap(ECapability.BATTERY, this.device)
				})

		}
	}
	updateValue(): void {
		const stateArr = Object.keys(this.device.state);
		if (!stateArr.length) return;
		stateArr.forEach(stateKey => {
			if (stateKey === 'detect') {
				this.service?.updateCharacteristic(this.platform.Characteristic.LeakDetected, deviceUtils.getDeviceStateByCap(ECapability.DETECT, this.device))
			} else if (stateKey === 'battery') {
				this.batteryService?.updateCharacteristic(this.platform.Characteristic.BatteryLevel, deviceUtils.getDeviceStateByCap(ECapability.BATTERY, this.device))
				this.batteryService?.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, +deviceUtils.getDeviceStateByCap(ECapability.BATTERY, this.device) < 20 ? 1 : 0)
			}
		})
	}
}
