using Xunit;

namespace Passing
{
	public class Tests
	{
		[Fact]
		public void FailOne()
		{
			Assert.False(true);
		}

		[Fact]
		public void FailTwo()
		{
			Assert.False(true);
		}

		[Fact]
		public void FailThree()
		{
			Assert.False(true);
		}
	}
}

