package p09.interfaces;
/** [인터페이스]
 * -.인터페이스를 활용해 사용해보기
 **/
public class RemoteControllerExample1 {
	public static void main(String[] args) {
		//객체생성
//		Remotecontrol rc0 = new RemoteControl(); //인터페이스도 자신의 객체를 생성할 수 없다.
		RemoteControl rc = new Television(); //인터페이스를 구현한 클래스의 객체를 생성할 수 있다.
		RemoteControl rc1 = new Audio();
		
		rc.turnOn(); //메소드 호출 메소드 선언부의 호출
		rc.setVolume(20); //setVolume(20)
		rc.setMute(true); //구현(상속)된 메소드
		rc.turnOff();
		RemoteControl.changeBattery();
	
		
		rc1.turnOn(); //메소드 호출 메소드 선언부의 호출
		rc1.setVolume(-5); //
		rc1.setMute(true);
		rc1.turnOff();
		RemoteControl.changeBattery();

	}
}
