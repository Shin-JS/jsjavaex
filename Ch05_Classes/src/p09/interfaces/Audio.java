package p09.interfaces;

/**[인터페이스]
 * interface의 구현객체 생성
 * -.class 클래스명 implements 인터페이스명 {} 
 **/
public class Audio implements RemoteControl{
	//필드
	private int volume;
	@Override
	public void turnOn() {
		System.out.println("오디오를 켭니다.");
	}

	@Override
	public void turnOff() {
		System.out.println("오디오를 끕니다.");
	}

	@Override
	public void setVolume(int volume) {
		
		if(volume > RemoteControl.MAX_VOLUME) {
			this.volume = RemoteControl.MAX_VOLUME;
		}else if (volume < RemoteControl.MIN_VALUE) {
			this.volume = RemoteControl.MIN_VALUE;
		}else {
			this.volume = volume;
		}
		System.out.println("현재 오디오의 볼륨은: " + volume);
	}

}
