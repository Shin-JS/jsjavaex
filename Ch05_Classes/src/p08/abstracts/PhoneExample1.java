package p08.abstracts;
/**[추상클래스]
 * 
 **/
public class PhoneExample1 {
	public static void main(String[] args) {
		SmartPhone smartPhone = new SmartPhone("고길동");
		smartPhone.turnOn(); //부모클래스의 메소드 호출
		smartPhone.internetSearch(); //자식클래스에서 추가된 메소드 호출
		smartPhone.turnOff(); //부모클래스의 메소드 호출
		
		Phone phone = smartPhone; //자동형변환(자식타입에서 부모타입으로):Promotion
		phone.turnOff(); //부모메소드 호출(자식메소드에서 재정의 안했음)
		phone.turnOn(); //부모메소드 호출(자식메소드에서 재정의 안했음)
//		phone.internetSearch();//부모클래스에 없는 메소드(자식클래스에서 추가된 메소드)

		
	}
}
