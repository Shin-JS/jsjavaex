package p03.methods;
/** [메소드]
 * -.메소드 선언: 리턴타입 메소드명(매개변수){실행부; return문;}// 리턴타입에 void를 적으면 실행부에 return문이 없어도 됨
 * 
 **/
public class Calculator {
	//메소드
	void powerOn() { //리턴타입에 void가 있으므로 실행부에 리턴문이 없음
		System.out.println("전원을 켭니다.");
	}
	int plus(int x, int y) { //리턴타입이 int이므로 실행부에 리턴문이 존재 
		int result = x + y;
		return result;
	}
	
	double divide(int x, int y) { //리턴타입이 double이므로 실행부에 리턴문이 존재
		double result = (double)x / (double)y;
		return result;
	}
	void powerOff() { //리턴타입에 void가 있으므로 실행부에 리턴문이 없음
		System.out.println("전원을 끕니다.");
	}
}
