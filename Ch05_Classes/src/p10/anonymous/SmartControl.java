package p10.anonymous;

public class SmartControl implements RemoteControl {

	@Override
	public void turnOn() {
		System.out.println("SmartTv를 켭니다.");
	}

	@Override
	public void turnOff() {
		System.out.println("SmartTv를 끕니다.");
	}

}
