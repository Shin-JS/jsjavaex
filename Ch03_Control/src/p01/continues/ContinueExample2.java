package p01.continues;
/**
 * continue문 
 * -.중첩된 for문에서의 continue문
 **/
public class ContinueExample2 {
	public static void main(String[] args) {
		for(int i = 0; i <= 10; i++) {
			for(int j = 0; j<=10; j++) {
				System.out.println("j="+j);
				if(j>2) {
					continue; //j가 2보다 크면 아래부분 실행하지 않고 진행
				}System.out.println("j출력");
			}System.out.println("i = " + i);
		}
	}
}
