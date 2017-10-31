package p01.references;
/**
 * 
 **/
public class ArrExample3 {
	public static void main(String[] args) {
		String[] str = {"산토끼","집토끼","판토끼","죽은토끼","알칼리토끼"};
		for(int i = 0; i < str.length ; i++) {
			System.out.println(str[i]);
		}
		System.out.println("====================");
		//향상된 for문 사용시
		for(String k:str) {
			System.out.println(k);
		}
	}
}
