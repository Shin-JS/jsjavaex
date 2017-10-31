package p01.fors;
/**
 * for반복문(초기값;조건값;증감) 
 **/
public class ForExample4 {
	public static void main(String[] args) {
		for (int i = 0; i <= 4; i++) {
			for (int j = 0; j <= i; j++) {
				System.out.print("*");
			}
			System.out.println();
		}
		System.out.println("-----------");
		for (int i = 4; i >= 0 ; i--) {
			for (int j = 0; j <= i; j++) {
				System.out.print("*");
			}System.out.println();
		}
		System.out.println("-----------");
		for (int i = 4; i >= 0 ; i--) {
			for (int j = 0; j <= i; j++) {
				System.out.print(" ");
			}System.out.println("*");
		}
		System.out.println("-----------");
		for (int i = 0; i <= 4 ; i++) {
			for (int j = 0; j <= i; j++) {
				System.out.print(" ");
			}System.out.println("*");
		}
	}
}
