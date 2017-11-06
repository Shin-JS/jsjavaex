package p05.polymorphism.instanceofs;

public class InstanceOfExample1 {
	//메소드
	public static void main(String[] args) {
		//객체생성
		Parent parentA = new Child(); //부모타입으로 선언한 참조변수에 자식객체 대입
		method1(parentA);
		method2(parentA);
		
		Parent parentB = new Parent();
		method1(parentB); //예외처리(if문에서 instanceof를 사용했음)
		method2(parentB); //오류발생 - 생성을 부모객체로 했기 때문에, 자식타입으로 casting불가
	}

	public static void method1(Parent parent) {
		if(parent instanceof Child) {  //값으로 받은 parent가 Child타입으로 Casting이 가능한지 확인하는 메소드(?)
			Child child = (Child)parent;
			System.out.println("method1 - Child 변환 성공");
		}else {
			System.out.println("method1 - Child 변환 불가");
		}
	}
	public static void method2(Parent parent) {
		Child child = (Child)parent;
		System.out.println("method2-Child로 변환 성공");
	}
}
