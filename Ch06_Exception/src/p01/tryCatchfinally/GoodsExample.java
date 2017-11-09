package p01.tryCatchfinally;
/**[예외처리]
*
**/
public class GoodsExample {
	public static void main(String[] args) {
		try {
		//객체생성
		Goods goods = new Goods("새우깡",1000);
		System.out.println(goods.getGoodsName()+"의 가격은 "+goods.getPrice());
		

		goods.upPrice(200);
		System.out.println(goods.getGoodsName()+"의 가격은 "+goods.getPrice());
		goods.upPrice(300); //가격 상한보다 큰 값이므로 예외 발생
		goods.downPrice(250);
		}catch(Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
