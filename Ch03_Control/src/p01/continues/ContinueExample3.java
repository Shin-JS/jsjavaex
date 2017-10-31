package p01.continues;
/**
 *  continue문
 **/
public class ContinueExample3 {
	public static void main(String[] args) {
		for(int i = 0; i<=10; i++) {
			int num1 = (int)(Math.random()*6 + 1);
			int num2 = (int)(Math.random()*6 + 1);
			if((num1+num2)==6) {
				continue;
			}
			System.out.println(i+"회"+num1+"+"+num2+"="+(num1+num2));
		}
	}
}
