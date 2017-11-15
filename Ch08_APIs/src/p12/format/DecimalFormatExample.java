package p12.format;

import java.text.DecimalFormat;

/**[API]
 * 
 **/
public class DecimalFormatExample {
	public static void main(String[] args) {
		double num = 1235467.89;
		
		DecimalFormat df = new DecimalFormat("0");//정수만 출력.. 결과값을 보니 소숫점 반올림된듯
		System.out.println(df.format(num));
		
		df = new DecimalFormat("0.0"); //소숫점 첫번째자리까지 출력, 아랫자리 반올림
		System.out.println(df.format(num));
		
		df = new DecimalFormat("0000000000.00000");//전체자리 갯수 고정, 남는자리는 0으로 찍어줌
		System.out.println(df.format(num));
		
		df = new DecimalFormat("#"); //빈자리는 채우지 않는다
		System.out.println(df.format(num));
		
		df = new DecimalFormat("#.#");
		System.out.println(df.format(num));
		
		df = new DecimalFormat("##########.#####"); //빈자리는 채우지 않고 출력
		System.out.println(df.format(num));
		
		df = new DecimalFormat("#.0");
		System.out.println(df.format(num));
		df = new DecimalFormat("+#.0"); //앞에 기호
		System.out.println(df.format(num));
		df = new DecimalFormat("-#.0");
		System.out.println(df.format(num));
		
		df = new DecimalFormat("#,###.0"); //단위구분기호삽입
		System.out.println(df.format(num));
		
		df = new DecimalFormat("0.0E0"); //부동소수점 표시
		System.out.println(df.format(num));
		
		df = new DecimalFormat("+#,### ; -#,###"); //양수음수 경우에따라 기호 넣기
		System.out.println(df.format(num));
		
		df = new DecimalFormat("#.# %"); //백분율로 표시
		System.out.println(df.format(num));
		
		df = new DecimalFormat("\u00A4 #,###");
		System.out.println(df.format(num));
		
	}
}
