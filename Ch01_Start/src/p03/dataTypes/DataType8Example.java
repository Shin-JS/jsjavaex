package p03.dataTypes;
/**
 * 기본데이터 타입을 클래스화한 객체를 Wrapper(래퍼)클래스라고 함. 
 **/
//유니코드값(char에 저장된 character값)을 2진수로 출력가능한가?
public class DataType8Example {
	public static void main(String[] args) {
		//변수
		char charValue1 = '가';
		char charValue2 = '한';
		char charValue3 = '글';
		//int타입을 객체화 한 클래스(값저장 + 메소드)
		System.out.println("\'가\'의 2진표기법"+Integer.toBinaryString(charValue1));
		System.out.println("\'한\'의 2진표기법"+Integer.toBinaryString(charValue2));
		System.out.println("\'글\'의 2진표기법"+Integer.toBinaryString(charValue3));
		
	}
}
