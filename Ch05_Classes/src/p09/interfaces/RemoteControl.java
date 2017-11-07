package p09.interfaces;
/** [인터페이스]
 * -.인터페이스 선언
 **/
public interface RemoteControl {
	//상수(final이 없어도 인터페이스에서는 상수)
	public int MAX_VOLUME = 10;
	public int MIN_VALUE = 0;
	
	//추상메소드
	//메소드의 호출은 메소드명(선언부)의 호출
	public void turnOn(); //호출시 turnOn();
	public void turnOff(); //호출시 turnOff();
	public void setVolume(int volume); //호출시 setVolume(숫자);
	//JAVA 8에서 추가
	//interface 구현체에 영향을 미치지 않는 메소드
	default void setMute(boolean mute) { //default메소드는 일반메소드이므로 실행부가 있어야함
		if(mute) {
			System.out.println("음소거모드");
		}else {
			System.out.println("음소거모드 해제");
		}
	}
	//정적 메소드(static메소드)
	static void changeBattery() {
		System.out.println("건전지를 교환합니다.");
	}
	
}
