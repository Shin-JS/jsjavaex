package p02.inherits;
/**[상속]
 **/
public class Car {
	//필드
	int  a = 7; //탑승인원
	//메소드
	void move() {
		System.out.println("이동한다");
	}
	
}//Car클래스 끝

class Bus extends Car{ //Car클래스를 상속받음
	int a = 25; //자식클래스에서 재정의된 필드값과 메소드
	void move() {
		System.out.println(a + "명을 태우고 이동한다.");
	}
}//Bus 클래스 끝
class Ambulance extends Car{
	int a = 10;//자식클래스에서 재정의된 필드값과 메소드
	void move() {
		System.out.println("사이렌을 울리면서 이동한다");
	}
	//메소드 추가, 상속받은 자식의 클래스에서 메소드 추가 가능
	void special() { //자식클래스에서 새로 만들어진 메소드
		System.out.println("환자를 태우고 이동한다.");
	}
}//Ambulance클래스 끝
class FireEngine extends Car{
	int a = 11;//자식클래스에서 재정의된 필드값과 메소드
	void move() {
		System.out.println("물을 뿌리면서 이동한다.");
	}
}//FireEngine클래스 끝