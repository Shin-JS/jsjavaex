package p01.standard;
/**[API]
 *  Object클래스의 toString()메소드는 자체로 사용하기 보다 상속받은 클래스에서 객체의 필드정보를 
 *  출력하는 용도로 재정의하여 사용
 **/
public class SmartPhoneExample1 {
	public static void main(String[] args) {
		//객체생성
		SmartPhone smartPhone = new SmartPhone("Samsung","Android7.0");
		String strObj = smartPhone.toString();
		System.out.println(strObj);
	}
}
