package p03.methods;
/**[메소드]
 * 
 **/
public class Car {
	//필드
	int gas;
	//생성자
	Car(){}
	//메소드
	void setGas(int gas) {  //리턴문이 없는 void타입의 메소드
		this.gas = gas;
	}
	boolean isLeftGas() {  //리턴타입이 boolean인 메소드
		if(gas == 0) {
			System.out.println("gas가 없습니다.");
			return false;
		}
		System.out.println("gas가 있습니다.");
		return true;
	}
	void run() { //리턴문이 없는 void타입의 메소드
		while(true) {
			if (gas>0) {
				System.out.println("달립니다.(gas잔량: " + gas + ")");
				gas -= 1; //==gas--
			}else {
				System.out.println("멈춥니다.(gas잔량:" + gas + ")");
				return; //리턴문을 사용한 이유는 값의 리턴이 아닌, 메소드의 실행을 중지하는 역할을 시키기 위해서
			}
		}
	}
}
