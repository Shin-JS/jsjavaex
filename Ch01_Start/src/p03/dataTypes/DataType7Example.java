package p03.dataTypes;
/**
 * 논리타입 boolean(true/false) 
 * 
 **/
public class DataType7Example extends Object {//모든 클래스는 자바 최상위 클래스인 Object에서 상속받아 생성됨. 
	//생성자 - 클래스명과 동일한 이름을 가진 리턴타입이 존재하지않는 메소드
	DataType7Example() {}
	//변수선언
	public static void main(String[] args) {
		boolean stop = true; //boolean타입의 초기값으로 true값을 저장.
		//if()문: ()안의 값, 혹은 식의 결과값이 참이면 블럭{}내의 명령문 실행
		//()안의 값이 거짓이면 블럭{}값을 지나침
		if (stop) {  //stop변수가 true/false확인
			System.out.println("정지");
		} else {
			System.out.println("진행");
		}
		
		if (stop==true) {  //stop==true라는 식의 결과값이 true/false인지 확인
			System.out.println("정지");
		} else {
			System.out.println("진행");
		}
	}
}
