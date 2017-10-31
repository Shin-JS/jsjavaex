package p01.operations;
/**
 * 논리연산 부정 ! 
 * -.true를 false로 false를 true로
 **/
public class NotOperExample1 {
	public static void main(String[] args) {
		boolean stop = false;
		if(!stop) {  //!+false = true
			System.out.println("정지");
		}else {
			System.out.println("진행");
		}
		
		if(stop==false) {  //stop==false▶true, stop!=false▶false
			System.out.println("정지");
		}else {
			System.out.println("진행");
		}
		
	}
}
