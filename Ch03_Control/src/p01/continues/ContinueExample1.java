package p01.continues;
/**
 * continue문
 **/
public class ContinueExample1 {
	public static void main(String[] args) {
		int i =  0; //main method의 로컬변수
		for(i = 0; i <=10; i++) {
			System.out.println("\t i=" + i);
			if(i>5) {
				break; //반복문블럭을 빠져나가는 break
			}System.out.println("\t i=" + i);
		}
		System.out.println("i = " + i);
		System.out.println("==========================");
		for(i = 0; i <= 10; i++) {
			System.out.println("\t i= " + i);
			if(i >5 ) {
				continue; //반복문 블럭내에서 continue문 아래의 명령문을 skip하는 문
			}System.out.println("\t i= " + i);
		}
		System.out.println("i = " + i);
	}
}
